export const statusColorMap: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  Open: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
  },
  "Under Review": {
    bg: "bg-yellow-50 dark:bg-yellow-950/40",
    text: "text-yellow-700 dark:text-yellow-300",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  Planned: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
  },
  "In Progress": {
    bg: "bg-orange-50 dark:bg-orange-950/40",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800",
  },
  Complete: {
    bg: "bg-green-50 dark:bg-green-950/40",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-800",
  },
  Closed: {
    bg: "bg-gray-50 dark:bg-gray-900/40",
    text: "text-gray-600 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-700",
  },
};

export const GradientColor = [
  "from-[#FF6B6B] to-[#FFD93D]",
  "from-[#6A11CB] to-[#2575FC]",
  "from-[#FF512F] to-[#DD2476]",
  "from-[#00C9FF] to-[#92FE9D]",
  "from-[#4158D0] to-[#C850C0]",
  "from-[#3F5EFB] to-[#FC466B]",
  "from-[#11998E] to-[#38EF7D]",
  "from-[#8E2DE2] to-[#4A00E0]",
  "from-[#F7971E] to-[#FFD200]",
  "from-[#30CFD0] to-[#330867]",
];
