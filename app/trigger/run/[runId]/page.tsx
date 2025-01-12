import { ScrapingRunComponent } from "./_components/task-component";

type Params = Promise<{
    runId: string
}>

type SearchParams = Promise<{
    publicAccessToken: string;
}>

interface RunPageProps {
    params: Params
    searchParams: SearchParams
}

export default async function RunPage({ params, searchParams }: RunPageProps) {
    const { runId } = await params;
    const { publicAccessToken } = await searchParams;

    if (!publicAccessToken) {
        return <div>No public access token provided</div>;
    }

    return (
        <ScrapingRunComponent runId={runId} accessToken={publicAccessToken} />
    );
}