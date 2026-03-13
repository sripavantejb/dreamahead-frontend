#!/usr/bin/env python3
"""
Convert data/course_fit_test_template.xlsx into SQL seed statements
for Course Fit tables. Supabase removed – output goes to scripts/output/.
"""
from __future__ import annotations

import math
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, List, Optional

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "course_fit_test_template.xlsx"
OUTPUT = ROOT / "scripts" / "output" / "seed_course_fit_data.sql"


def sql_literal(value: Optional[str]) -> str:
  if value is None:
    return "null"
  if isinstance(value, bool):
    return "true" if value else "false"
  if isinstance(value, (int, float)):
    if isinstance(value, float) and math.isnan(value):
      return "null"
    return str(int(value) if float(value).is_integer() else value)
  text = str(value).replace("'", "''")
  return f"'{text}'"


def array_literal(values: Iterable[str]) -> str:
  clean: List[str] = []
  for val in values:
    if val is None:
      continue
    text = str(val).strip()
    if not text:
      continue
    text = text.replace('"', '\\"')
    clean.append(f'"{text}"')
  inner = ",".join(clean)
  return f"'{{{inner}}}'"


def safe_int(value: float | int | None, default: int = 0) -> int:
  if value is None:
    return default
  if isinstance(value, float) and math.isnan(value):
    return default
  return int(value)


def main() -> None:
  if not SOURCE.exists():
    raise SystemExit(f"Missing source workbook: {SOURCE}")

  course_df = pd.read_excel(SOURCE, sheet_name="course_map")
  master_df = pd.read_excel(SOURCE, sheet_name="courses_master").set_index("course_key")
  ui_df = pd.read_excel(SOURCE, sheet_name="ui_copy")

  specialization_map = {
      "CSE-Core": "Core",
      "CSE-AI": "AI/ML",
      "CSE-ML": "AI/ML",
      "CSE-Data": "Data",
      "CSE-Cyber": "Cyber",
      "CSE-DB": "Database",
      "CSE-Cloud": "Cloud",
      "ECE": "ECE",
      "ME": "Mechanical",
      "CE": "Civil",
      "BBA": "Business",
      "B.Com": "Commerce",
      "B.Des": "Design",
  }

  course_group_map = {
      "CSE": "CSE",
      "ECE": "ECE",
      "ME": "Mechanical",
      "CE": "Civil",
      "BBA": "Business",
      "B.Com": "Commerce",
      "B.Des": "Design",
  }

  course_rows = []
  for _, row in course_df.iterrows():
    course_key = row["course_key"]
    specialization_key = specialization_map.get(course_key, course_key)
    group_key = "CSE" if course_key.startswith("CSE-") else course_group_map.get(course_key, "General")
    master = master_df.loc[course_key]

    description_parts = [master.get("notes", "")]
    subjects = master.get("typical_subjects")
    if isinstance(subjects, str) and subjects.strip():
      description_parts.append(f"Subjects: {subjects}")
    description = " ".join(part.strip() for part in description_parts if isinstance(part, str))

    specialization_tags = set(
        [group_key, specialization_key] +
        [token.strip() for token in str(row["specialization"]).replace("&", "/").split("/") if token.strip()]
    )

    course_rows.append(
        {
            "course_key": course_key,
            "course_name": row["course_name"],
            "degree_type": master.get("degree_type", "B.Tech"),
            "course_group": group_key,
            "specialization_key": specialization_key,
            "importance": [
                row["imp_analytical"],
                row["imp_logical"],
                row["imp_creative"],
                row["imp_communication"],
                row["imp_math"],
                row["imp_biology"],
                row["imp_data"],
                row["imp_coding"],
                row["imp_design"],
                row["imp_cyber"],
                row["imp_ai_ml"],
            ],
            "specialization_tags": list(specialization_tags),
            "description": description or None,
        }
    )

  question_sets = []
  question_rows = []
  option_rows = []
  for set_no in range(1, 11):
    sheet_name = f"set_{set_no}"
    df = pd.read_excel(SOURCE, sheet_name=sheet_name)
    df = df.dropna(subset=["question_id", "option_id", "question_text", "option_text"])
    df["question_id"] = df["question_id"].astype(int)
    df["option_id"] = df["option_id"].astype(int)

    unique_questions = df[["question_id", "question_text"]].drop_duplicates().sort_values("question_id")
    question_count = unique_questions["question_id"].nunique()

    question_sets.append(
        {
            "set_no": set_no,
            "title": f"Course Fit Set {set_no}",
            "description": f"Imported from {sheet_name}",
            "question_count": question_count,
            "is_active": set_no == 1,
        }
    )

    for _, q in unique_questions.iterrows():
      question_rows.append(
          {
              "set_no": set_no,
              "question_no": int(q["question_id"]),
              "question_text": q["question_text"],
              "helper_note": None,
          }
      )

    for _, opt in df.iterrows():
      option_rows.append(
          {
              "set_no": set_no,
              "question_no": int(opt["question_id"]),
              "option_no": int(opt["option_id"]),
              "option_text": opt["option_text"],
              "helper_note": opt.get("note", None),
              "weights": [
                  safe_int(opt.get("w_analytical")),
                  safe_int(opt.get("w_logical")),
                  safe_int(opt.get("w_creative")),
                  safe_int(opt.get("w_communication")),
                  safe_int(opt.get("w_math")),
                  safe_int(opt.get("w_biology")),
                  safe_int(opt.get("w_data")),
                  safe_int(opt.get("w_coding")),
                  safe_int(opt.get("w_design")),
                  safe_int(opt.get("w_cyber")),
                  safe_int(opt.get("w_ai_ml")),
              ],
              "specialization_hint": opt.get("specialization_hint", None),
          }
      )

  hint_map = {
      "AI/ML": ["AI/ML"],
      "Data": ["Data"],
      "Data/AI": ["Data", "AI/ML"],
      "Data/ML": ["Data", "AI/ML"],
      "Cyber": ["Cyber"],
      "Core": ["Core"],
      "Core CS": ["Core"],
      "Core/DB": ["Core", "Database"],
      "Database": ["Database"],
      "Design": ["Design"],
      "Design/AI": ["Design", "AI/ML"],
  }

  neighbor_map = {
      "CSE-AI": [("CSE-ML", "AI + ML"), ("CSE-Data", "Data Science")],
      "CSE-ML": [("CSE-AI", "AI First"), ("CSE-Data", "Data Science")],
      "CSE-Data": [("CSE-DB", "Databases"), ("CSE-Core", "Core CS")],
      "CSE-DB": [("CSE-Data", "Data Science"), ("CSE-Core", "Core CS")],
      "CSE-Core": [("CSE-DB", "Core + DB"), ("CSE-Cyber", "Cybersecurity")],
      "CSE-Cyber": [("CSE-Core", "Core CS"), ("CSE-Cloud", "Cloud/DevOps")],
      "CSE-Cloud": [("CSE-Core", "Core CS"), ("CSE-Data", "Data Science")],
      "ECE": [("CSE-Core", "Core CSE"), ("CSE-Data", "Data Science")],
      "ME": [("ECE", "Electronics"), ("CE", "Civil")],
      "CE": [("ECE", "Electronics"), ("ME", "Mechanical")],
      "BBA": [("B.Com", "Commerce"), ("B.Des", "Design/Brand")],
      "B.Com": [("BBA", "Business"), ("B.Des", "Design/Brand")],
      "B.Des": [("CSE-Core", "UI-heavy CSE"), ("BBA", "Marketing/Brand")],
  }

  lines: List[str] = []
  banner = f"-- Auto-generated on {datetime.now(timezone.utc).isoformat()} from {SOURCE.name}"
  lines.append(banner)

  # Course map insert
  course_cols = (
      "course_key, course_name, degree_type, course_group, specialization_key,"
      " importance_analytical, importance_logical, importance_creative,"
      " importance_communication, importance_math, importance_biology, importance_data,"
      " importance_coding, importance_design, importance_cyber, importance_ai_ml,"
      " specialization_tags, description"
  )
  course_values = []
  for entry in course_rows:
    weights = ", ".join(str(int(value)) for value in entry["importance"])
    tags = array_literal(sorted(entry["specialization_tags"]))
    desc = sql_literal(entry["description"])
    course_values.append(
        f"  ({sql_literal(entry['course_key'])}, {sql_literal(entry['course_name'])}, "
        f"{sql_literal(entry['degree_type'])}, {sql_literal(entry['course_group'])}, "
        f"{sql_literal(entry['specialization_key'])}, {weights}, {tags}::text[], {desc})"
    )
  lines.append(f"insert into public.cft_course_map ({course_cols})\nvalues\n" + ",\n".join(course_values) +
               "\non conflict (course_key) do update set\n"
               "  course_name = excluded.course_name,\n"
               "  degree_type = excluded.degree_type,\n"
               "  course_group = excluded.course_group,\n"
               "  specialization_key = excluded.specialization_key,\n"
               "  importance_analytical = excluded.importance_analytical,\n"
               "  importance_logical = excluded.importance_logical,\n"
               "  importance_creative = excluded.importance_creative,\n"
               "  importance_communication = excluded.importance_communication,\n"
               "  importance_math = excluded.importance_math,\n"
               "  importance_biology = excluded.importance_biology,\n"
               "  importance_data = excluded.importance_data,\n"
               "  importance_coding = excluded.importance_coding,\n"
               "  importance_design = excluded.importance_design,\n"
               "  importance_cyber = excluded.importance_cyber,\n"
               "  importance_ai_ml = excluded.importance_ai_ml,\n"
               "  specialization_tags = excluded.specialization_tags,\n"
               "  description = excluded.description,\n"
               "  last_updated = now();\n"
               )

  # Specialization relations
  rel_values = []
  for hint, bases in hint_map.items():
    for base in bases:
      rel_values.append(
          f"  ({sql_literal(base)}, {sql_literal(hint)}, 3.0)"
      )
  lines.append("insert into public.cft_specialization_relations "
               "(base_specialization, related_specialization, boost_cap)\nvalues\n" +
               ",\n".join(rel_values) +
               "\non conflict (base_specialization, related_specialization) do update set\n"
               "  boost_cap = excluded.boost_cap;\n")

  # Course neighbors
  neighbor_values = []
  for course, neighbors in neighbor_map.items():
    for rank, (neighbor_key, label) in enumerate(neighbors, start=1):
      neighbor_values.append(
          f"  ({sql_literal(course)}, {sql_literal(neighbor_key)}, {sql_literal(label)}, {rank})"
      )
  lines.append("insert into public.cft_course_neighbors "
               "(course_key, neighbor_course_key, label, display_rank)\nvalues\n" +
               ",\n".join(neighbor_values) +
               "\non conflict (course_key, neighbor_course_key) do update set\n"
               "  label = excluded.label,\n"
               "  display_rank = excluded.display_rank;\n")

  # Question sets
  set_values = []
  for entry in question_sets:
    set_values.append(
        f"  ({entry['set_no']}, {sql_literal(entry['title'])}, {sql_literal(entry['description'])}, "
        f"{entry['question_count']}, {'true' if entry['is_active'] else 'false'})"
    )
  lines.append("insert into public.cft_question_sets "
               "(set_no, title, description, question_count, is_active)\nvalues\n" +
               ",\n".join(set_values) +
               "\non conflict (set_no) do update set\n"
               "  title = excluded.title,\n"
               "  description = excluded.description,\n"
               "  question_count = excluded.question_count,\n"
               "  is_active = excluded.is_active;\n")

  # Questions
  question_values = []
  for entry in question_rows:
    question_values.append(
        f"  ({entry['set_no']}, {entry['question_no']}, {sql_literal(entry['question_text'])}, "
        f"{sql_literal(entry['helper_note'])})"
    )
  lines.append("insert into public.cft_questions "
               "(set_no, question_no, question_text, helper_note)\nvalues\n" +
               ",\n".join(question_values) +
               "\non conflict (set_no, question_no) do update set\n"
               "  question_text = excluded.question_text,\n"
               "  helper_note = excluded.helper_note;\n")

  # Options
  option_values = []
  for entry in option_rows:
    weights = ", ".join(str(value) for value in entry["weights"])
    option_values.append(
        f"  ({entry['set_no']}, {entry['question_no']}, {entry['option_no']}, "
        f"{sql_literal(entry['option_text'])}, {sql_literal(entry['helper_note'])}, {weights}, "
        f"{sql_literal(entry['specialization_hint'])})"
    )
  lines.append("insert into public.cft_options "
               "(set_no, question_no, option_no, option_text, helper_note,"
               " w_analytical, w_logical, w_creative, w_communication, w_math, w_biology,"
               " w_data, w_coding, w_design, w_cyber, w_ai_ml, specialization_hint)\nvalues\n" +
               ",\n".join(option_values) +
               "\non conflict (set_no, question_no, option_no) do update set\n"
               "  option_text = excluded.option_text,\n"
               "  helper_note = excluded.helper_note,\n"
               "  w_analytical = excluded.w_analytical,\n"
               "  w_logical = excluded.w_logical,\n"
               "  w_creative = excluded.w_creative,\n"
               "  w_communication = excluded.w_communication,\n"
               "  w_math = excluded.w_math,\n"
               "  w_biology = excluded.w_biology,\n"
               "  w_data = excluded.w_data,\n"
               "  w_coding = excluded.w_coding,\n"
               "  w_design = excluded.w_design,\n"
               "  w_cyber = excluded.w_cyber,\n"
               "  w_ai_ml = excluded.w_ai_ml,\n"
               "  specialization_hint = excluded.specialization_hint;\n")

  # UI copy
  ui_values = []
  for _, row in ui_df.iterrows():
    ui_values.append(
        f"  ({sql_literal(row['key'])}, {sql_literal(row['value'])}, 'general', null)"
    )
  lines.append("insert into public.cft_ui_copy (key, value, category, description)\nvalues\n" +
               ",\n".join(ui_values) +
               "\non conflict (key) do update set\n"
               "  value = excluded.value,\n"
               "  category = excluded.category,\n"
               "  description = excluded.description,\n"
               "  updated_at = now();\n")

  OUTPUT.parent.mkdir(parents=True, exist_ok=True)
  OUTPUT.write_text("\n".join(lines) + "\n")
  print(f"Wrote seed SQL to {OUTPUT}")


if __name__ == "__main__":
  main()
