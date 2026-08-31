"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function TestPage() {
  return (
    <div className="p-20 flex flex-col gap-10">
      <h1 className="text-2xl font-bold mb-4">Dropdown Test Page</h1>
      
      <div className="border p-4 rounded-lg bg-gray-50">
        <h2 className="text-xl mb-2">1. Select Component</h2>
        <Select>
          <SelectTrigger className="w-[200px]" id="test-select">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent id="test-select-content">
            <SelectItem value="opt1">Option 1</SelectItem>
            <SelectItem value="opt2">Option 2</SelectItem>
            <SelectItem value="opt3">Option 3</SelectItem>
          </SelectContent>
        </Select>
        <div className="mt-4 p-4 bg-blue-100 h-20 rounded" id="content-below-select">
          Content below select (should be pushed down)
        </div>
      </div>

      <div className="border p-4 rounded-lg bg-gray-50">
        <h2 className="text-xl mb-2">2. DropdownMenu Component</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" id="test-dropdown">Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent id="test-dropdown-content">
            <DropdownMenuItem>Menu Item 1</DropdownMenuItem>
            <DropdownMenuItem>Menu Item 2</DropdownMenuItem>
            <DropdownMenuItem>Menu Item 3</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="mt-4 p-4 bg-green-100 h-20 rounded" id="content-below-dropdown">
          Content below dropdown (should be pushed down)
        </div>
      </div>
    </div>
  );
}
