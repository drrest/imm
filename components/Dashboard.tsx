"use client";

import React, { useState, useMemo } from "react";
import { DataManager, FirmData } from "./DataManager";
import { GlassCard } from "./ui/GlassCard";
import { MetricChart } from "./MetricChart";
import { MetricTable } from "./MetricTable";
import { Search, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
    const [data, setData] = useState<FirmData[]>([]);
    const [selectedFirm, setSelectedFirm] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [executionTime, setExecutionTime] = useState<number | null>(null);


    const companies = useMemo(() => {
        const map = new Map<string, FirmData[]>();
        data.forEach((row) => {
            if (row.year >= 2017 && row.year <= 2021) {
                if (!map.has(row.name)) {
                    map.set(row.name, []);
                }
                map.get(row.name)?.push(row);
            }
        });
        return map;
    }, [data]);

    const firmNames = useMemo(() => Array.from(companies.keys()).sort(), [companies]);


    const filteredFirms = useMemo(() => {
        if (!searchQuery) return [];
        return firmNames.filter(name =>
            name.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 10); // Limit to 10
    }, [firmNames, searchQuery]);


    const hasValidData = (rows: FirmData[]) => {
        const yearSet = new Set(rows.map(r => r.year));
        const years = [2017, 2018, 2019, 2020, 2021];
        for (let i = 0; i < years.length - 1; i++) {
            if (yearSet.has(years[i]) && yearSet.has(years[i + 1])) {
                return true;
            }
        }
        return false;
    };


    const topFirms = useMemo(() => {
        if (companies.size === 0) return [];

        const firmStats = Array.from(companies.entries())
            .filter(([_, rows]) => hasValidData(rows)) // Filter out invalid
            .map(([name, rows]) => {
                // Find latest year record for sorting by latest MV
                const latestRow = rows.reduce((prev, curr) => (prev.year > curr.year ? prev : curr));
                return {
                    name,
                    metric: latestRow.market_value,
                    metricLabel: "Market Value",
                    year: latestRow.year
                };
            });

        // Sort by metric desc
        return firmStats.sort((a, b) => b.metric - a.metric).slice(0, 50);
    }, [companies]);


    const results = useMemo(() => {
        if (!selectedFirm || !companies.has(selectedFirm)) return [];

        const start = performance.now();

        // Sort logic
        const firmData = companies.get(selectedFirm)!.sort((a, b) => a.year - b.year);
        const yearMap = new Map(firmData.map(r => [r.year, r]));
        const years = [2017, 2018, 2019, 2020, 2021];
        const calcResults = [];

        for (let i = 0; i < years.length - 1; i++) {
            const yPrev = years[i];
            const yCurr = years[i + 1];

            if (yearMap.has(yPrev) && yearMap.has(yCurr)) {
                const prev = yearMap.get(yPrev)!;
                const curr = yearMap.get(yCurr)!;

                try {
                    const nVal = (curr.profit / curr.sales) - (prev.profit / prev.sales);


                    if (nVal !== 0 && prev.market_value !== 0 && curr.sales !== 0 && prev.sales !== 0) {
                        const mvGrowth = (curr.market_value - prev.market_value) / prev.market_value;
                        const mVal = mvGrowth / nVal;
                        if (isFinite(mVal)) {
                            calcResults.push({
                                years: `${yPrev}-${yCurr}`,
                                n: nVal,
                                m: mVal,
                                label: `${yPrev}-${yCurr}`
                            });
                        }
                    }
                } catch (e) {
                    console.error("Calculation error", e);
                }
            }
        }

        const end = performance.now();
        setExecutionTime(end - start);

        return calcResults;
    }, [selectedFirm, companies]);


    return (
        <div className="container mx-auto p-6 space-y-8 max-w-[1600px]">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                        IMM <span className="text-white/20 text-2xl font-light">Cloud Calculator</span>
                    </h1>
                    <p className="text-white/50 mt-1">Financial Cloud Calculator</p>
                </div>

                {executionTime !== null && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-mono text-green-400">
                        <Clock className="w-4 h-4" />
                        {executionTime.toFixed(2)}ms
                    </div>
                )}
            </header>

            {/* Data Section */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Sidebar / Controls */}
                <div className="space-y-6 lg:col-span-4">
                    <DataManager onDataLoaded={setData} />

                    {data.length > 0 && (
                        <div className="space-y-6">
                            <GlassCard className="overflow-visible z-20">
                                <label className="block text-sm font-medium text-white/50 mb-2">Select Firm</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-black/40 text-white placeholder-gray-500 focus:outline-none focus:bg-black/60 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:text-sm transition-all"
                                        placeholder="Search firm..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            if (e.target.value === "") setSelectedFirm("");
                                        }}
                                    />

                                    {/* Autocomplete Dropdown */}
                                    {searchQuery && filteredFirms.length > 0 && (
                                        <div className="absolute z-50 mt-1 w-full bg-[#1a1a1a] border border-white/10 rounded-md shadow-lg max-h-60 overflow-auto">
                                            {filteredFirms.map((firm) => (
                                                <button
                                                    key={firm}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-purple-600 hover:text-white transition-colors"
                                                    onClick={() => {
                                                        setSelectedFirm(firm);
                                                        setSearchQuery(firm);
                                                    }}
                                                >
                                                    {firm}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 text-xs text-white/30">
                                    {companies.size} firms loaded
                                </div>
                            </GlassCard>

                            {/* Top 50 List */}
                            <GlassCard className="max-h-[600px] overflow-y-auto custom-scrollbar">
                                <h3 className="text-lg font-bold mb-4 text-white/80 sticky top-0 bg-black/20 backdrop-blur-md py-2 -mt-2">Top 50 by Market Value (Analyzable)</h3>
                                <div className="space-y-2">
                                    {topFirms.map((firm, idx) => (
                                        <div
                                            key={firm.name}
                                            onClick={() => {
                                                setSelectedFirm(firm.name);
                                                setSearchQuery(firm.name);
                                            }}
                                            className={cn(
                                                "flex justify-between items-center p-2 rounded-lg cursor-pointer transition-all hover:bg-white/10",
                                                selectedFirm === firm.name ? "bg-purple-500/20 border border-purple-500/30" : "bg-white/5 border border-transparent"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-mono text-white/30 w-5">#{idx + 1}</span>
                                                <span className="text-sm font-medium text-white/90 truncate max-w-[200px]" title={firm.name}>{firm.name}</span>
                                            </div>
                                            <div className="text-xs text-green-300 font-mono">
                                                {firm.metric.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="lg:col-span-8 space-y-6">
                    {selectedFirm && results.length > 0 ? (
                        <>
                            <MetricChart data={results} firmName={selectedFirm} />
                            <MetricTable results={results} />
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center p-12 text-center text-white/20 border-2 border-dashed border-white/5 rounded-3xl">
                            {data.length === 0 ? "Please load a dataset to begin." :
                                !selectedFirm ? "Select a firm to view metamorphosis analysis." :
                                    "Insufficient data for this firm (requires consecutive years)."}
                        </div>
                    )}
                </div>

                {/* Documentation Section */}
                <div className="md:col-span-12">
                    <GlassCard>
                        <h2 className="text-xl font-bold text-white mb-4">How it works & What it shows</h2>
                        <div className="grid md:grid-cols-2 gap-6 text-sm text-white/70">
                            <div>
                                <h3 className="font-semibold text-purple-300 mb-2">How to use</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Select a firm from the <strong>Top 50</strong> list on the left or use the <strong>Search</strong> bar.</li>
                                    <li>The system automatically analyzes financial data for consecutive years (2017-2021).</li>
                                    <li>Firms without consecutive data are excluded from the Top 50 list.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-pink-300 mb-2">The chart plots the relationship between two key derived metrics:</h3>
                                <div className="space-y-2">
                                    <ul className="list-disc list-inside">
                                        <li><strong>Axis X (N)</strong>: Change in profitability (Rentability) between years.</li>
                                        <li><strong>Axis Y (M)</strong>: Market value elasticity relative to profitability changes.</li>
                                    </ul>
                                    <p className="opacity-70 mt-2">
                                        The horizontal line represents a synchronous change in stock prices relative to the growth of the firm's profit rate. A significant increase in stock prices relative to profit rate growth indicates an accumulation of unsecured liabilities, signaling the inflation of an economic bubble with a risk of default.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </section>
        </div>
    );
}
