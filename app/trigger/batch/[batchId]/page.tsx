import { BatchComponent } from "./_components/batch-component";

type Params = Promise<{
    batchId: string
}>

type SearchParams = Promise<{
    publicAccessToken: string;
}>

interface BatchPageProps {
    params: Params
    searchParams: SearchParams
}

export default async function BatchPage({ params, searchParams }: BatchPageProps) {
    const { batchId } = await params;
    const { publicAccessToken } = await searchParams;

    if (!publicAccessToken) {
        return <div>No public access token provided</div>;
    }

    return (
        <BatchComponent batchId={batchId} accessToken={publicAccessToken} />
    );
}
