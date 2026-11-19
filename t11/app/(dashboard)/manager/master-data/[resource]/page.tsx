import { notFound } from "next/navigation";
import { MasterDataManager } from "@/components/master-data/master-data-manager";
import {
  MASTER_DATA_DEFINITIONS,
  MASTER_DATA_RESOURCES,
} from "@/lib/master-data-definitions";
import { MasterDataResource } from "@/types/master-data";

export function generateStaticParams() {
  return MASTER_DATA_RESOURCES.map((resource) => ({ resource }));
}

export const instant = false;

export default async function MasterDataPage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  if (!Object.hasOwn(MASTER_DATA_DEFINITIONS, resource)) notFound();

  return (
    <MasterDataManager
      key={resource}
      resource={resource as MasterDataResource}
    />
  );
}
