"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { Store } from "@prisma/client"; 
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useOrigin } from "@/hooks/use-origin";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { AlertModal } from "@/components/modals/alert-modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ManageStoreConnectProps {
  initialData: Store;
}



export default function ManageStoreConnect({ initialData }: ManageStoreConnectProps) {
  

  const onSubmit = async (data: any) => {
    try {

    } catch (error: any) {

    } finally {

    }
  };

  

  return (
    <>
      
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">

              <CardTitle className="text-2xl">Manage your stores account</CardTitle>



          </div>
        </CardHeader>
        <CardContent>
          
        </CardContent>
        <CardFooter className="flex justify-between">
         
        </CardFooter>
      </Card>
    </>
  );
}