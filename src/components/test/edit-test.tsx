import { TestDetails } from "../../types/test";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Settings } from "lucide-react";
import CreateTestClient from "../../app/(mgmt)/test/create/create-test.client";

export default function EditTest({ testDetails }: { testDetails: TestDetails }) {

 return <Dialog>

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
    <CreateTestClient initialData={testDetails} />
   </div>
  </DialogContent>
 </Dialog>

}