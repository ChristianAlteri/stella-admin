'use client'

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Store } from "@prisma/client";
import { Trash2 } from "lucide-react";


interface SettingsFormProps {
    initialData: Store
}

const SettingsForm: React.FC<SettingsFormProps> = ({
    initialData
}) => {
    return ( 
        <>
            <div className="flex items-center justify-between">
                <Heading 
                    title="Settings"
                    description="Manage your stores settings"
                />
                <Button 
                    variant="destructive"
                    size="icon"
                    onClick={() => {}}
                >
                    <Trash2 className="w-5 h-5 hover:text-stone-900" />
                </Button>
            </div> 
            <Separator />
        </>
    );
}
 
export default SettingsForm;