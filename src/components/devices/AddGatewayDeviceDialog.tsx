import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { createGatewayDevice } from "@/api/adminApi";
import { toast } from "sonner";

// Define the form schema
const gatewayDeviceSchema = z.object({
  serial_number: z.string().min(1, "Serial number is required"),
  device_secret: z.string().min(32, "Secret must be at least 32 characters"),
});

type GatewayDeviceFormValues = z.infer<typeof gatewayDeviceSchema>;

interface AddGatewayDeviceDialogProps {
  onSuccess?: () => void;
  className?: string;
  buttonText?: string;
}

const AddGatewayDeviceDialog: React.FC<AddGatewayDeviceDialogProps> = ({
  onSuccess,
  className = "",
  buttonText = "Add Gateway Device",
}) => {
  const [open, setOpen] = React.useState(false);

  const form = useForm<GatewayDeviceFormValues>({
    resolver: zodResolver(gatewayDeviceSchema),
    defaultValues: {
      serial_number: "",
      device_secret: "",
    },
  });

  const onSubmit = async (values: GatewayDeviceFormValues) => {
    try {
      await createGatewayDevice({
        serial_number: values.serial_number,
        device_secret: values.device_secret,
      });
      
      toast.success("Gateway device created successfully");
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating gateway device:", error);
      toast.error(error.message || "Failed to create gateway device");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className={className}>
          <PlusCircle className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Gateway Device</DialogTitle>
          <DialogDescription>
            Register a new gateway device to manage shelf sensors
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="serial_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter device serial number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="device_secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Secret</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter device secret" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Creating..." : "Create Gateway Device"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGatewayDeviceDialog;
