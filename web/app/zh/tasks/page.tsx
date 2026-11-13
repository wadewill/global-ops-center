import TaskCenter from "../../../components/tasks/TaskCenter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ListingScore 商家服务｜任务中心",
  description: "按优先级查看商品问题、修复建议与任务状态。",
};

export default function ChineseTaskCenter() {
  return <TaskCenter locale="zh-CN" />;
}
