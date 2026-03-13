import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, LucideIcon, Users, TrendingUp, Clock } from "lucide-react";
import { BackToHomeButton } from "./BackToHomeButton";

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface TileDescriptionProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  gradient: string;
  benefits: Benefit[];
  fomoStats: {
    users?: string;
    successRate?: string;
    avgTime?: string;
  };
  fomoText: string;
  onStart: () => void;
  ctaText?: string;
}

export const TileDescription = ({
  icon: Icon,
  title,
  subtitle,
  description,
  gradient,
  benefits,
  fomoStats,
  fomoText,
  onStart,
  ctaText = "Start Test Now"
}: TileDescriptionProps) => {
  return (
    <>
      <BackToHomeButton />
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
        {/* Hero Section */}
        <div className={`relative py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-r ${gradient}`}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="container mx-auto max-w-4xl relative z-10 text-center text-white">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/20 backdrop-blur-sm">
                <Icon className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 animate-fade-in px-2">
              {title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium mb-4 sm:mb-6 animate-fade-in px-2" style={{ animationDelay: "0.1s" }}>
              {subtitle}
            </p>
            <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto opacity-90 animate-fade-in px-4 leading-relaxed" style={{ animationDelay: "0.2s" }}>
              {description}
            </p>

            {/* FOMO Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto mb-6 sm:mb-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              {fomoStats.users && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2" />
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{fomoStats.users}</div>
                  <div className="text-xs sm:text-sm opacity-90">Students</div>
                </div>
              )}
              {fomoStats.successRate && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2" />
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{fomoStats.successRate}</div>
                  <div className="text-xs sm:text-sm opacity-90">Success Rate</div>
                </div>
              )}
              {fomoStats.avgTime && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2" />
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{fomoStats.avgTime}</div>
                  <div className="text-xs sm:text-sm opacity-90">Avg Time</div>
                </div>
              )}
            </div>

            {/* FOMO Hook */}
            <Card className="bg-orange-500/20 backdrop-blur-sm border-orange-300/30 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <CardContent className="p-4 sm:p-6">
                <p className="text-sm sm:text-base md:text-lg font-semibold">
                  🚀 {fomoText}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12 md:py-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3 sm:mb-4">Why Take This?</h2>
          <p className="text-center text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base px-4 leading-relaxed">
            Discover what thousands of students already know
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="shadow-card hover:shadow-elegant transition-shadow animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="p-2 sm:p-3 rounded-xl bg-gradient-card w-fit mb-2 sm:mb-3">
                    <benefit.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2 text-base sm:text-lg">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <Card className={`shadow-elegant bg-gradient-to-r ${gradient} text-white border-0`}>
            <CardContent className="p-6 sm:p-8 text-center">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">Ready to Get Started?</h3>
              <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 opacity-90">
                Takes only 5-10 minutes • Get instant results • 100% Free
              </p>
              <Button 
                onClick={onStart}
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto font-semibold w-full sm:w-auto"
              >
                {ctaText}
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <p className="text-xs sm:text-sm mt-3 sm:mt-4 opacity-75">
                No login required to start • Sign up only to download results
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
