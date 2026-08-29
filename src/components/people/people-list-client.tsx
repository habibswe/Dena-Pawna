'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { AddPersonDialog } from '@/components/people/add-person-dialog';

export function PeopleListClient({ peopleBalances }: { peopleBalances: any[] }) {
  const [query, setQuery] = useState('');
  
  const filteredPeople = peopleBalances.filter(person => 
    person.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search people..." 
          className="pl-9 glass-panel" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {peopleBalances.length === 0 ? (
        <Card className="glass-panel border-dashed p-8 text-center">
          <div className="space-y-3">
            <h3 className="text-lg font-medium">No people yet</h3>
            <p className="text-muted-foreground">Add someone to start tracking your money.</p>
            <AddPersonDialog />
          </div>
        </Card>
      ) : filteredPeople.length === 0 ? (
        <Card className="glass-panel border-dashed p-8 text-center">
          <p className="text-muted-foreground">No people match your search.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPeople.map(person => {
            const isSettled = person.balance === 0;
            const isPositive = person.balance > 0;
            const color = isSettled ? 'text-muted-foreground' : isPositive ? 'text-primary' : 'text-destructive';
            const statusText = isSettled ? 'Settled ✓' : isPositive ? `Owes you ৳${Math.abs(person.balance).toLocaleString()}` : `You owe ৳${Math.abs(person.balance).toLocaleString()}`;
            
            return (
              <Link key={person.id} href={`/people/${person.id}`}>
                <Card className="glass-panel hover:bg-secondary/20 transition-colors cursor-pointer border-primary/10">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="h-12 w-12 border border-primary/20">
                      <AvatarFallback className="bg-primary/5 text-primary text-lg">
                        {person.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-1">
                      <h4 className="font-semibold">{person.name}</h4>
                      <p className={`text-sm font-medium ${color}`}>
                        {statusText}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </>
  );
}
