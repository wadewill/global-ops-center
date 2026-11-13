import TaskCenter from "../../../components/tasks/TaskCenter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ListingScore | Task center",
  description: "Review catalog issues, suggested fixes and task progress by priority.",
};

export default function EnglishTaskCenter() {
  return <TaskCenter locale="en" />;
}
