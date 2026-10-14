'use client';

import { Button } from '@/components/ui/button';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { AdministrationContext } from '@/constants/enum';
import { ADMINISTRATION_CONTEXT_LABEL } from '@/constants/treatment';
import type { OwnerCarePlan } from '@/types/treatment.type';
import { formatDate } from '@/utils/date';
import { formatScheduledAt } from '@/utils/treatment-format';
import { ChevronDown, Eye } from 'lucide-react';

/** Read-only preview of what the owner will be able to see; the data comes from `toOwnerCarePlan`. */
export function OwnerCarePreview({ plan }: { plan: OwnerCarePlan }) {
	return (
		<Collapsible className="rounded-xl p-4 ring-1 ring-foreground/10">
			<CollapsibleTrigger
				render={
					<Button variant="ghost" size="sm" className="-ml-2 w-fit">
						<Eye />
						Lo que verá el propietario
						<ChevronDown />
					</Button>
				}
			/>
			<CollapsibleContent className="flex flex-col gap-4 pt-3">
				<p className="text-xs text-muted-foreground">
					Solo se comparten medicamento, dosis, indicaciones y próximas citas.
					Las notas internas nunca se incluyen.
				</p>
				<ul className="flex flex-col gap-3">
					{plan.medications.map((medication, index) => (
						<li
							key={`${medication.name}-${index}`}
							className="flex flex-col gap-0.5"
						>
							<p className="text-sm font-medium">{medication.name}</p>
							<p className="text-sm text-muted-foreground">
								{[
									medication.dose,
									medication.frequency,
									medication.duration,
									ADMINISTRATION_CONTEXT_LABEL[medication.context],
								].join(' · ')}
							</p>
							{medication.instructions && (
								<p className="text-sm">{medication.instructions}</p>
							)}
							{medication.context === AdministrationContext.CLINIC
								? medication.nextApplicationAt && (
										<p className="text-xs text-muted-foreground">
											Próxima visita:{' '}
											{formatScheduledAt(medication.nextApplicationAt)}
										</p>
									)
								: medication.endsAt && (
										<p className="text-xs text-muted-foreground">
											Hasta el {formatDate(medication.endsAt)}
										</p>
									)}
						</li>
					))}
				</ul>
				{plan.instructions && (
					<p className="text-sm whitespace-pre-line">{plan.instructions}</p>
				)}
				{plan.followUp && (
					<p className="text-sm">
						Control: {formatDate(plan.followUp.recommendedDate)} ·{' '}
						{plan.followUp.reason}
					</p>
				)}
			</CollapsibleContent>
		</Collapsible>
	);
}
