export default function userIdToColor(id: string | undefined): string {
    if (!id) return '#808080';
    let hash = 0;
    for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) | 0;
    const h = Math.abs(hash) % 360;
    return hslToHex(h, 70, 50);
}

function hslToHex(h: number, s: number, l: number): string {
    const sN = s / 100;
    const lN = l / 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = sN * Math.min(lN, 1 - lN);
    const f = (n: number) => {
        const v = lN - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return Math.round(255 * v).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}