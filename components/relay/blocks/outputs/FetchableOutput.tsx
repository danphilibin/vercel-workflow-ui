"use client";

import { useState } from "react";

type FetchedData = {
	data: Array<Record<string, unknown>>;
	page: number;
	hasMore: boolean;
};

export function FetchableOutput({
	title,
	workflow,
	loader,
}: {
	title: string;
	workflow: string;
	loader: string;
}) {
	const [data, setData] = useState<FetchedData | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async (page = 0) => {
		setLoading(true);
		setError(null);

		try {
			const params = encodeURIComponent(JSON.stringify({ page }));
			const res = await fetch(
				`/api/loader/${workflow}/${loader}?params=${params}`,
			);

			if (!res.ok) {
				throw new Error("Failed to fetch");
			}

			const result = (await res.json()) as FetchedData;
			setData(result);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="py-3">
			<div className="text-xs font-medium text-[#666] uppercase tracking-wider mb-2">
				{title}
			</div>

			{!data && !loading && (
				<button
					type="button"
					onClick={() => fetchData(0)}
					className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-[#333] rounded-lg text-sm text-[#ccc] transition-colors"
				>
					Load Data
				</button>
			)}

			{loading && (
				<div className="text-sm text-[#666] flex items-center gap-2">
					<span className="w-1.5 h-1.5 rounded-full bg-[#666] animate-pulse" />
					Loading...
				</div>
			)}

			{error && <div className="text-sm text-red-400">Error: {error}</div>}

			{data && (
				<div className="border border-[#333] rounded-lg overflow-hidden">
					{/* Simple table view */}
					{data.data.length > 0 && (
						<table className="w-full text-sm">
							<thead>
								<tr className="bg-white/8 border-b border-[#333]">
									{Object.keys(data.data[0]).map((key) => (
										<th
											key={key}
											className="px-3 py-2 text-left text-[#888] font-medium"
										>
											{key}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{data.data.map((row, i) => (
									<tr
										key={i}
										className={
											i !== data.data.length - 1 ? "border-b border-[#333]" : ""
										}
									>
										{Object.values(row).map((val, j) => (
											<td key={j} className="px-3 py-2 text-[#ccc]">
												{String(val)}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					)}

					{/* Pagination */}
					<div className="px-3 py-2 bg-white/5 border-t border-[#333] flex items-center justify-between">
						<span className="text-xs text-[#666]">Page {data.page + 1}</span>
						<div className="flex gap-2">
							{data.page > 0 && (
								<button
									type="button"
									onClick={() => fetchData(data.page - 1)}
									className="px-2 py-1 text-xs bg-white/10 hover:bg-white/15 rounded text-[#ccc]"
								>
									← Prev
								</button>
							)}
							{data.hasMore && (
								<button
									type="button"
									onClick={() => fetchData(data.page + 1)}
									className="px-2 py-1 text-xs bg-white/10 hover:bg-white/15 rounded text-[#ccc]"
								>
									Next →
								</button>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

