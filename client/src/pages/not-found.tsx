import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, Music } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50">
      <Card className="w-full max-w-md mx-4 border-2 border-purple-200">
        <CardContent className="pt-6 text-center">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Music className="h-10 w-10 text-purple-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Oops! Page Not Found</h1>
          </div>

          <p className="text-gray-600 mb-6">
            We couldn't find the page you're looking for. Let's get you back to the music!
          </p>

          <Link href="/games">
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Home className="w-4 h-4 mr-2" />
              Back to Games
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
