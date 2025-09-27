import { ComputerIcon, MoonIcon, SunIcon } from "lucide-react";
import { Theme, useTheme } from "remix-themes";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { UBadge } from "~/components/uzzina/UBadge";
import { SIZES } from "~/lib/CONSTANTS";

export default function UITestingPage() {
  const [theme, setTheme] = useTheme();
  return (
    <div className="container mx-auto  px-8">
      <div className="border_after relative py-8 flex items-center justify-between">
        <h1 className="p-0">UI Testing Page</h1>
        <div>
          <ToggleGroup
            type="single"
            onValueChange={(value) => {
              if (value === "system") {
                setTheme(null);
              } else {
                setTheme(value as Theme);
              }
            }}
          >
            <ToggleGroupItem value={Theme.LIGHT}>
              <SunIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value={Theme.DARK}>
              <MoonIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value={"system"}>
              <ComputerIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      <div className="py-8 border_after relative">
        <div className="">
          <h2>Headings</h2>
        </div>
        <div>
          <h1>h1 – Lorem ipsum dolor sit amet consectetur adipisicing elit.</h1>
          <h2>h2 – Lorem ipsum dolor sit amet consectetur adipisicing elit.</h2>
          <h3>h3 – Lorem ipsum dolor sit amet consectetur adipisicing elit.</h3>
          <h4>h4 – Lorem ipsum dolor sit amet consectetur adipisicing elit.</h4>
          <h5>h5 – Lorem ipsum dolor sit amet consectetur adipisicing elit.</h5>
        </div>
      </div>
      <div className="py-8 border_after relative">
        <div>
          <h2>Badges</h2>
        </div>
        <div className="flex gap-8">
          <div className="flex gap-4 items-center">
            <UBadge size={SIZES.sm} value={12} />
            <UBadge size={SIZES.md} value={17} />
            <UBadge size={SIZES.lg} value={22} />
          </div>
          <div className="flex gap-4 items-center">
            <UBadge size={SIZES.sm} value={2} isDynamic />
            <UBadge size={SIZES.md} value={6} isDynamic />
            <UBadge size={SIZES.lg} value={22998.8} isDynamic />
          </div>
        </div>
      </div>
    </div>
  );
}
