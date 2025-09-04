"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import messages from "../../Messages.json"; 
// Import images (use actual relative path to assets)
import EventsImg from "../../../public/Events.png";
import MessagesImg from "../../../public/Newsletter.png";
import NewsletterImg from "../../../public/Weekly.png";
import WeeklyImg from "../../../public/messages.png";

// Array of imported image objects
const localImages = [EventsImg, MessagesImg, NewsletterImg, WeeklyImg];

const Home = () => {
  return (
    <>
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-12 py-16 bg-gradient-to-br from-[#fdfbfb] to-[#ebedee] min-h-screen">
        {/* Hero Section */}
        <section className="text-center mb-14 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-transparent bg-clip-text">
            Dive into the world of Anonymous Conversations
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-700 max-w-xl mx-auto">
            Explore{" "}
            <span className="font-semibold text-purple-700">Mystery Message</span>{" "}
            — Where your identity stays hidden and your voice is heard.
          </p>
        </section>

        {/* Carousel Section */}
        <Carousel
          plugins={[Autoplay({ delay: 3000 })]}
          className="w-full max-w-2xl"
        >
          <CarouselContent>
            {messages.map((message, index) => (
              <CarouselItem key={index}>
                <div className="p-3">
                  <Card className="backdrop-blur-lg bg-white/60 shadow-xl rounded-2xl overflow-hidden transition-transform hover:scale-105">
                    {/* Image section */}
                    <img
                      src={localImages[index % localImages.length].src}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Text section */}
                    <CardHeader className="text-center text-xl font-bold text-purple-700">
                      {message.title}
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      <p className="text-md md:text-lg font-medium text-gray-800 text-center">
                        {message.content}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hover:scale-105 transition-transform" />
          <CarouselNext className="hover:scale-105 transition-transform" />
        </Carousel>
      </main>

      {/* Footer */}
      <footer className="text-center p-6 bg-white border-t border-gray-200 text-sm text-gray-500">
        © 2025 <span className="font-semibold">True Feedback</span>. All rights reserved.
      </footer>
    </>
  );
};

export default Home;
