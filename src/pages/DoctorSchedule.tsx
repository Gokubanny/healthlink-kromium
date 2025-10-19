import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DoctorSidebar } from "@/components/DoctorSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Clock } from "lucide-react";
import { toast } from "sonner";

const DoctorSchedule = () => {
  const [schedule, setSchedule] = useState({
    monday: { enabled: true, start: "09:00", end: "17:00" },
    tuesday: { enabled: true, start: "09:00", end: "17:00" },
    wednesday: { enabled: true, start: "09:00", end: "17:00" },
    thursday: { enabled: true, start: "09:00", end: "17:00" },
    friday: { enabled: true, start: "09:00", end: "17:00" },
    saturday: { enabled: false, start: "09:00", end: "13:00" },
    sunday: { enabled: false, start: "09:00", end: "13:00" },
  });

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  const handleSave = () => {
    toast.success("Schedule updated successfully!");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-secondary">
        <Navbar />

        <div className="flex flex-1 w-full">
          <DoctorSidebar />

          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="mb-4">
              <SidebarTrigger />
            </div>

            <div className="mb-8 animate-fade-in">
              <h1 className="text-3xl font-heading font-bold mb-2">Schedule Management</h1>
              <p className="text-muted-foreground">Set your availability for appointments</p>
            </div>

            <div className="max-w-3xl">
              <Card className="p-6 mb-6 animate-fade-in">
                <div className="space-y-6">
                  {days.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between pb-4 border-b last:border-0">
                      <div className="flex items-center gap-4 flex-1">
                        <Switch
                          checked={schedule[key as keyof typeof schedule].enabled}
                          onCheckedChange={(checked) =>
                            setSchedule({
                              ...schedule,
                              [key]: { ...schedule[key as keyof typeof schedule], enabled: checked },
                            })
                          }
                        />
                        <Label className="text-base font-medium w-24">{label}</Label>
                      </div>
                      {schedule[key as keyof typeof schedule].enabled && (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <input
                              type="time"
                              value={schedule[key as keyof typeof schedule].start}
                              onChange={(e) =>
                                setSchedule({
                                  ...schedule,
                                  [key]: { ...schedule[key as keyof typeof schedule], start: e.target.value },
                                })
                              }
                              className="border rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <span className="text-muted-foreground">to</span>
                          <input
                            type="time"
                            value={schedule[key as keyof typeof schedule].end}
                            onChange={(e) =>
                              setSchedule({
                                ...schedule,
                                [key]: { ...schedule[key as keyof typeof schedule], end: e.target.value },
                              })
                            }
                            className="border rounded px-2 py-1 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              <Button onClick={handleSave} className="w-full">
                Save Schedule
              </Button>
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default DoctorSchedule;
