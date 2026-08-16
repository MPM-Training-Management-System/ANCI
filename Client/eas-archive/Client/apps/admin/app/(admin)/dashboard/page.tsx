"use client"

import { useParticipants } from "@/hooks/useParticipants";
import { StatGrid, PageSection, StatCard, StatCardSkeleton } from "@repo/ui/index";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";




export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
     const { count} = useParticipants();

     useEffect(() => {
        // Simulate API request
        const timer = setTimeout(() => {
          setLoading(false);
        }, 2000);
    
        return () => clearTimeout(timer);
      }, []);
    return(
        <PageSection
        title="Dashboard">
            <StatGrid>
                {loading ? (
                          <>
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                          </>
                        ) : (
                          <>
                
                <StatCard
                title="Total Users"
                description="Hello"
                value={count}
                icon={Plus}
                variant="primary"
                >
                </StatCard>
                <StatCard
                title="Total Users"
                description="Hello"
                value={20}
                icon={Plus}
                variant="primary"
                >
                </StatCard>
                <StatCard
                title="Total Users"
                description="Hello"
                value={20}
                icon={Plus}
                variant="primary"
                >
                </StatCard>
                <StatCard
                title="Total Users"
                description="Hello"
                value={20}
                icon={Plus}
                variant="primary"
                >
                </StatCard>
                </>
        )}
            </StatGrid>
            
        </PageSection>
    )
}