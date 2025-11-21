import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Button } from "../ui/button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "../ui/command";
import { useMatches } from "react-router";
import { UAvatar, UAvatarGroup } from "../uzzina/UAvatar";
import { cn } from "~/lib/utils";
import { useState } from "react";
import { CheckIcon, PlusIcon } from "lucide-react";
import { getFormattedPartnersName } from "~/lib/helpers";

export const PartnersCombobox = ({ selectedPartners, onSelect }: { selectedPartners?: string[]; onSelect?: (partners: string[]) => void }) => {


	// console.log(selectedPartners)
	const { partners } = useMatches()[1].loaderData as { partners: Partner[] };
	const [selected, setSelected] = useState<string[]>(selectedPartners || []);
	let currentPartners = selected.map((slug) => partners.find((partner) => partner.slug === slug)!)

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost">

					{selected.length > 0 ?
						<UAvatarGroup
							clamp={2}
							size="sm"
							title={getFormattedPartnersName(currentPartners)}
							avatars={currentPartners.map((partner) => ({
								id: partner.id,
								fallback: partner?.short,
								backgroundColor: partner?.colors[0],
								color: partner?.colors[1]
							})
							)} /> : <UAvatar size="sm" fallback="PR" />}

				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[400px] p-0">
				<Command >
					<CommandInput placeholder="Procurar parceiro..." />
					<CommandEmpty>Nenhum parceiro encontrado.</CommandEmpty>
					<CommandList className="p-2 outline-none">
						{
							partners.map((partner) => (
								<CommandItem key={partner.id}
									className={cn("flex gap-2 items-center")}
									onSelect={() => {
										let newPartners = [...selected]
										if (selected.includes(partner.slug)) {
											newPartners = newPartners.filter((slug) => slug !== partner.slug)
										} else {
											newPartners.push(partner.slug)
										}

										setSelected(newPartners)
										onSelect?.(newPartners)
									}}
								>
									<UAvatar fallback={partner.short} size="sm"
										backgroundColor={partner.colors[0]}
										color={partner.colors[1]} />
									{partner.title}
									<CheckIcon className={cn("ml-auto size-4", selected?.includes(partner.slug) ? "visible" : "invisible")} />
								</CommandItem>
							))
						}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};