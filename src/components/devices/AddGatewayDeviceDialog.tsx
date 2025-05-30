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

// Definice schématu formuláře
const gatewayDeviceSchema = z.object({
  serial_number: z.string().min(1, "Sériové číslo je povinné"),
  device_secret: z.string().min(32, "Tajný klíč musí mít alespoň 32 znaků"),
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
  buttonText = "Přidat Gateway zařízení",
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
      
      toast.success("Gateway zařízení bylo úspěšně vytvořeno");
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating gateway device:", error);
      toast.error(error.message || "Nepodařilo se vytvořit gateway zařízení");
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
          <DialogTitle>Přidat Gateway zařízení</DialogTitle>
          <DialogDescription>
            Zaregistrujte nové gateway zařízení pro správu senzorů regálů
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="serial_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sériové číslo</FormLabel>
                  <FormControl>
                    <Input placeholder="Zadejte sériové číslo zařízení" {...field} />
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
                  <FormLabel>Tajný klíč zařízení</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Zadejte tajný klíč zařízení" 
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
                {form.formState.isSubmitting ? "Vytváření..." : "Vytvořit Gateway zařízení"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGatewayDeviceDialog;
