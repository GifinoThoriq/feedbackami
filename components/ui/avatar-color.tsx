interface IProps {
  profile_color: string;
  first_name: string;
  last_name: string;
  size?: "small" | "default";
}

export default function AvatarColor({
  profile_color,
  first_name,
  last_name,
  size = "default",
}: IProps) {
  return (
    <div
      className={`flex ${
        size === "small" ? "h-6 w-6 text-xs" : "h-10 w-10 text-sm"
      } items-center justify-center rounded-full bg-gradient-to-r ${profile_color} font-semibold text-sidebar-primary-foreground`}
    >
      {first_name}
      {last_name}
    </div>
  );
}
