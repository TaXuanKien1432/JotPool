export default function userIdToColor(id: string | undefined): string {
    if (!id) return 'hsl(0, 0%, 50%)';
    let hash = 0;
    for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) | 0;
    return `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
}