import { TestDetails } from "../../types/test";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Settings } from "lucide-react";
import CreateTestClient from "../../app/(mgmt)/test/create/create-test.client";
import { useState } from "react";

export default function EditTest({
  testDetails,
  onEditSuccessful,
}: {
  testDetails: TestDetails;
  onEditSuccessful: (data: TestDetails) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEditSuccess = (data: TestDetails) => {
    setIsOpen(false); 
    onEditSuccessful(data); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span className="hidden lg:block">Edit Test</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Test</DialogTitle>
        </DialogHeader>
        <div className="w-full">
          <CreateTestClient
            initialData={testDetails}
            onEditSuccessful={handleEditSuccess} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
