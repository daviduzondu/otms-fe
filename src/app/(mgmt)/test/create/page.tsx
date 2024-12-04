import { Metadata } from "next";
import CreateTestClient from "./create-test.client";
import AuthGuard from "../../../../components/guards/auth-guard";

export const metadata: Metadata = {
 title: 'Create Test',
};

export default function CreateTest() {

 return <AuthGuard>
  <CreateTestClient />
 </AuthGuard>
}