import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import api from "@/lib/api";

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialty: string;
}

interface BookingFormProps {
  doctor: Doctor;
  onBookingSuccess?: () => void;
}

const BookingForm = ({ doctor, onBookingSuccess }: BookingFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    appointmentTime: "",
    type: "Consultation",
    mode: "In-person",
    reason: "",
    notes: "",
  });

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM", 
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    if (!formData.appointmentTime) {
      toast.error("Please select a time");
      return;
    }

    if (!formData.reason.trim()) {
      toast.error("Please provide a reason for the appointment");
      return;
    }

    try {
      setLoading(true);
      
      const appointmentData = {
        doctor: doctor._id,
        appointmentDate: selectedDate.toISOString().split('T')[0],
        appointmentTime: formData.appointmentTime,
        type: formData.type,
        mode: formData.mode,
        reason: formData.reason,
        notes: formData.notes,
      };

      const response = await api.post('/appointments', appointmentData);
      
      if (response.data.success) {
        toast.success("Appointment booked successfully!");
        setIsOpen(false);
        resetForm();
        onBookingSuccess?.();
      }
    } catch (error: any) {
      console.error("Error booking appointment:", error);
      toast.error(error.response?.data?.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setFormData({
      appointmentTime: "",
      type: "Consultation",
      mode: "In-person",
      reason: "",
      notes: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="w-full bg-primary hover:bg-primary-hover"
          onClick={() => setIsOpen(true)}
        >
          Book Now
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment with Dr. {doctor.firstName} {doctor.lastName}</DialogTitle>
          <DialogDescription>
            Schedule your {doctor.specialty.toLowerCase()} consultation
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Selection */}
          <div>
            <Label htmlFor="date">Appointment Date</Label>
            <div className="mt-1">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                className="rounded-md border"
              />
            </div>
          </div>

          {/* Time Selection */}
          <div>
            <Label htmlFor="time">Appointment Time</Label>
            <Select 
              value={formData.appointmentTime} 
              onValueChange={(value) => setFormData({ ...formData, appointmentTime: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Appointment Type */}
          <div>
            <Label htmlFor="type">Appointment Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Consultation">Consultation</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Routine Checkup">Routine Checkup</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Consultation Mode */}
          <div>
            <Label htmlFor="mode">Consultation Mode</Label>
            <Select 
              value={formData.mode} 
              onValueChange={(value) => setFormData({ ...formData, mode: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In-person">In-person</SelectItem>
                <SelectItem value="Video Call">Video Call</SelectItem>
                <SelectItem value="Phone Call">Phone Call</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason for Visit */}
          <div>
            <Label htmlFor="reason">Reason for Visit *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please describe your symptoms or reason for consultation..."
              rows={3}
              required
            />
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information you'd like to share..."
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingForm;