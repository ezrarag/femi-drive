"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { MapPin, Filter, Grid, Map, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function InventoryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")
  const [priceRange, setPriceRange] = useState([30, 100])
  const [searchTerm, setSearchTerm] = useState("")

  const vehicles = [
    {
      id: 1,
      make: "VOLKSWAGEN",
      model: "PASSAT",
      year: 2015,
      rate: 45,
      mileage: "85K",
      transmission: "AUTO",
      image: "/placeholder.svg?height=300&width=400",
      gigReady: true,
      location: "NEWARK AIRPORT",
      available: true,
    },
    {
      id: 2,
      make: "DODGE",
      model: "CHARGER",
      year: 2016,
      rate: 55,
      mileage: "72K",
      transmission: "AUTO",
      image: "/placeholder.svg?height=300&width=400",
      gigReady: true,
      location: "DOWNTOWN NEWARK",
      available: true,
    },
    {
      id: 3,
      make: "HONDA",
      model: "ACCORD",
      year: 2017,
      rate: 50,
      mileage: "68K",
      transmission: "AUTO",
      image: "/placeholder.svg?height=300&width=400",
      gigReady: true,
      location: "JERSEY CITY",
      available: false,
    },
    {
      id: 4,
      make: "TOYOTA",
      model: "CAMRY",
      year: 2018,
      rate: 48,
      mileage: "55K",
      transmission: "AUTO",
      image: "/placeholder.svg?height=300&width=400",
      gigReady: true,
      location: "NEWARK AIRPORT",
      available: true,
    },
  ]

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPrice = vehicle.rate >= priceRange[0] && vehicle.rate <= priceRange[1]
    return matchesSearch && matchesPrice
  })

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/10">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2 text-white/60 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm tracking-wider">BACK</span>
          </Link>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold tracking-wider">
            FE
            <br />
            MI
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20"
          >
            FLEET
          </Button>
        </div>
      </nav>

      <div className="px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-6xl font-black tracking-tighter mb-4">VEHICLE FLEET</h1>
          <p className="text-white/60 tracking-wider text-sm">PREMIUM VEHICLES FOR GIG ECONOMY SUCCESS</p>
        </div>

        {/* Filters */}
        <div className="mb-12 p-6 border border-white/10 rounded-lg bg-white/5 backdrop-blur-sm">
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2 tracking-widest uppercase">Search</label>
              <Input
                placeholder="MAKE OR MODEL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2 tracking-widest uppercase">Type</label>
              <Select>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="ALL TYPES" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/20">
                  <SelectItem value="all">ALL TYPES</SelectItem>
                  <SelectItem value="sedan">SEDAN</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="compact">COMPACT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2 tracking-widest uppercase">Location</label>
              <Select>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="ALL LOCATIONS" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/20">
                  <SelectItem value="all">ALL LOCATIONS</SelectItem>
                  <SelectItem value="newark-airport">NEWARK AIRPORT</SelectItem>
                  <SelectItem value="downtown-newark">DOWNTOWN NEWARK</SelectItem>
                  <SelectItem value="jersey-city">JERSEY CITY</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2 tracking-widest uppercase">Sort</label>
              <Select>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="PRICE: LOW TO HIGH" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/20">
                  <SelectItem value="price-low">PRICE: LOW TO HIGH</SelectItem>
                  <SelectItem value="price-high">PRICE: HIGH TO LOW</SelectItem>
                  <SelectItem value="newest">NEWEST ADDED</SelectItem>
                  <SelectItem value="year">YEAR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2 tracking-widest uppercase">
                PRICE RANGE: ${priceRange[0]} - ${priceRange[1]} PER DAY
              </label>
              <Slider value={priceRange} onValueChange={setPriceRange} max={100} min={30} step={5} className="w-full" />
            </div>
            <div className="flex items-end space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <Filter className="h-4 w-4 mr-2" />
                GIG-READY ONLY
              </Button>
              <div className="flex border border-white/20 rounded-full overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none bg-white/10 hover:bg-white/20"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                  className="rounded-none bg-white/10 hover:bg-white/20"
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-white/60 tracking-wider text-sm">{filteredVehicles.length} VEHICLES AVAILABLE</p>
        </div>

        {/* Vehicle Grid */}
        {viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className="bg-white/5 border-white/10 overflow-hidden hover:bg-white/10 transition-all"
              >
                <div className="relative">
                  <Image
                    src={vehicle.image || "/placeholder.svg"}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {vehicle.gigReady && (
                      <Badge className="bg-green-500/80 text-white text-xs tracking-wider">GIG READY</Badge>
                    )}
                    {!vehicle.available && (
                      <Badge variant="destructive" className="text-xs tracking-wider">
                        UNAVAILABLE
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2 tracking-wider">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <div className="flex justify-between text-sm text-white/60 mb-2 tracking-wider">
                    <span>{vehicle.mileage} MILES</span>
                    <span>{vehicle.transmission}</span>
                  </div>
                  <div className="flex items-center text-sm text-white/60 mb-4 tracking-wider">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{vehicle.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold tracking-wider">${vehicle.rate}/DAY</span>
                    <Button
                      size="sm"
                      disabled={!vehicle.available}
                      className="rounded-full bg-white text-black hover:bg-white/90 tracking-wider"
                    >
                      {vehicle.available ? "BOOK NOW" : "UNAVAILABLE"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
            <Map className="h-16 w-16 mx-auto text-white/40 mb-4" />
            <h3 className="text-lg font-semibold mb-2 tracking-wider">MAP VIEW</h3>
            <p className="text-white/60 tracking-wider">INTERACTIVE MAP SHOWING VEHICLE LOCATIONS</p>
          </div>
        )}
      </div>
    </div>
  )
}
