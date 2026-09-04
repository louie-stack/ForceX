import type { ChartGroup, ChartKind, Control, Grain, Unit } from "./types";

/**
 * The Xamine chart catalog: one entry per analytics surface in the live
 * application. Pages, the sub-navigation, the dashboard grid and the data
 * provider are all generated from this list.
 */
export interface ChartDef {
  slug: string;
  group: ChartGroup;
  title: string;
  /** One line for cards and the surfaces grid. */
  summary: string;
  /** The Information tab. */
  information: string;
  /** The Methodology tab. */
  methodology: string;
  kind: ChartKind;
  controls: Control[];
  grains: Grain[];
  unit: Unit;
  /** Path in the live application. */
  appPath: string;
  /** Optional callout link shown beside the title. */
  note?: { label: string; href: string };
}

export const GROUPS: Record<ChartGroup, string> = {
  market: "Market activity",
  network: "Network activity",
  address: "Address activity",
  supply: "Supply activity",
  mweb: "MWEB activity",
};

export const GROUP_ORDER: ChartGroup[] = ["market", "network", "address", "supply", "mweb"];

export const CHARTS: ChartDef[] = [
  {
    slug: "spot-price-ohlc",
    group: "market",
    title: "Spot Price OHLC",
    summary: "Kraken LTC-USD daily open, high, low, and close price.",
    information:
      "The reference price for everything priced in dollars on Xamine. Daily open, high, low and close for LTC-USD from Kraken, with the current spot attached as a labelled state snapshot rather than folded into the candles.",
    methodology:
      "Candles are built from Kraken's LTC-USD trade feed, bucketed to UTC days. Weekly candles anchor to Monday 00:00 UTC. The current spot is a point-in-time snapshot carrying its own as-of timestamp and is never summed with completed candles.",
    kind: "candles",
    controls: ["grain", "range"],
    grains: ["day", "week"],
    unit: "usd",
    appPath: "/xamine/charts/spot-price-ohlc",
  },
  {
    slug: "adjusted-economic-volume",
    group: "market",
    title: "Adjusted Economic Volume",
    summary: "Estimated economic payment volume with confidence bands.",
    information:
      "How much value actually changed hands. Gross output volume counts every coin an output touches, including change returning to the sender. Adjusted volume removes change outputs and self-transfers so the number you see is payment, not plumbing.",
    methodology:
      "For every transaction, outputs are classified as payment or change using script-type, ordering and value heuristics that are scored against a confidence model. Self-transfers, where inputs and outputs resolve to the same address cluster, are excluded. The adjusted series is the sum of payment outputs per bucket; gross is the unfiltered output total. Each series is anchored to the validated height it was computed from.",
    kind: "timeseries",
    controls: ["grain", "range"],
    grains: ["day", "week", "month"],
    unit: "ltc",
    appPath: "/xamine/charts/adjusted-volume",
    note: { label: "How adjusted volume is calculated", href: "/xamine/economic-throughput" },
  },
  {
    slug: "adjusted-transaction-volume-distribution",
    group: "market",
    title: "Adjusted Transaction Volume Distribution",
    summary: "Transaction counts grouped by estimated economic payment amount.",
    information:
      "What does a typical Litecoin transaction actually look like? This chart distributes recent transactions by the payment amount they actually moved, not their gross output size, so you can see the real footprint of Litecoin activity: micropayments, retail-scale, settlement-scale, all free of the change-output noise that distorts naive views.",
    methodology:
      "Each transaction in the window is assigned to a logarithmic bucket by its adjusted payment value in LTC. Coinbase transactions and transactions whose payment classification falls below the confidence threshold are excluded and reported in the disclosure. Buckets are half-open: a transaction of exactly 1 LTC falls in the 1 to 5 bucket.",
    kind: "distribution",
    controls: ["window"],
    grains: ["day"],
    unit: "count",
    appPath: "/xamine/charts/adjusted-tx-volume-distribution",
    note: { label: "How adjusted volume is calculated", href: "/xamine/economic-throughput" },
  },
  {
    slug: "transactions",
    group: "network",
    title: "Transactions",
    summary: "Confirmed transaction count.",
    information:
      "The heartbeat of Litecoin. Count the transactions confirmed on chain per day, week, month, or year, and flip to a cumulative view to see long-run growth at a glance. Pulled directly from canonical, validation-gated chain data, so what you see is what has been mined and confirmed.",
    methodology:
      "One count per transaction included in a block on the validated main chain, including coinbase transactions. Buckets are UTC calendar periods; a block belongs to the bucket of its median-time-past. Reorganised blocks are removed at the reorg-safe depth and never counted twice. The cumulative view is a running sum from the first day in range.",
    kind: "timeseries",
    controls: ["grain", "view", "range"],
    grains: ["day", "week", "month"],
    unit: "count",
    appPath: "/xamine/charts/transactions",
  },
  {
    slug: "transaction-volume-distribution",
    group: "network",
    title: "Transaction Volume Distribution",
    summary: "Transaction counts grouped by total sent amount.",
    information:
      "The raw shape of Litecoin transfers. Each transaction is placed in a bucket by the total value of its outputs, change included. Compare it with the adjusted distribution to see how much of the network's apparent volume is change returning to the sender.",
    methodology:
      "Each transaction in the window is assigned to a logarithmic bucket by the sum of its output values in LTC. Coinbase transactions are excluded. Buckets are half-open on the upper bound. The snapshot carries the height it was built from.",
    kind: "distribution",
    controls: ["window"],
    grains: ["day"],
    unit: "count",
    appPath: "/xamine/charts/tx-volume-distribution",
  },
  {
    slug: "network-hashrate",
    group: "network",
    title: "Network Hashrate",
    summary: "Average network hashrate.",
    information:
      "The computational weight behind every confirmed block. Estimated hashrate over time shows the security budget of the network and the arrival of new mining capacity.",
    methodology:
      "Hashrate is derived from block difficulty and observed block interval: difficulty multiplied by 2^32 divided by the mean block time in the bucket. Daily values are averaged into weekly and monthly buckets. The estimate is noisy over short windows by nature; the day grain should be read as an indicator, not a measurement.",
    kind: "timeseries",
    controls: ["grain", "range"],
    grains: ["day", "week", "month"],
    unit: "hashrate",
    appPath: "/xamine/charts/hashrate",
  },
  {
    slug: "active-addresses",
    group: "address",
    title: "Active Addresses",
    summary: "Active and new address activity.",
    information:
      "Who showed up. Active addresses are the distinct addresses that sent or received in the period; new addresses are those seen on chain for the first time. Together they separate returning users from growth.",
    methodology:
      "An address is active on a day if it appears in any input or output of a confirmed transaction that day. New addresses are those with no prior on-chain appearance. Distinct daily counts cannot be summed honestly, so this chart is day grain only. MWEB addresses are not observable and are excluded.",
    kind: "timeseries",
    controls: ["range"],
    grains: ["day"],
    unit: "count",
    appPath: "/xamine/charts/active-addresses",
  },
  {
    slug: "total-addresses",
    group: "address",
    title: "Total Addresses",
    summary: "Cumulative unique addresses observed on the network.",
    information:
      "Litecoin's footprint in a single line. The Total Addresses chart shows the cumulative count of every transparent address ever observed on chain, the long-run adoption curve, useful for narrative-level views of network growth and saturation.",
    methodology:
      "The running count of distinct transparent addresses that have appeared in any confirmed output since genesis. Each bucket reports the total at bucket close. The series is reconciled against the validated address ledger at every checkpoint.",
    kind: "timeseries",
    controls: ["grain", "range"],
    grains: ["day", "week", "month"],
    unit: "count",
    appPath: "/xamine/charts/total-addresses",
  },
  {
    slug: "active-address-balance-distribution",
    group: "address",
    title: "Active Address Balance Distribution",
    summary: "Transparent address supply grouped by balance range over yearly snapshots.",
    information:
      "Where the coins sit. Transparent addresses with a non-zero balance are grouped by balance range at the snapshot, showing how supply is spread between dust, retail, whale and exchange-scale holdings.",
    methodology:
      "A balance distribution is a state snapshot, not an interval aggregate, so it is reported at a year-end snapshot height. Balances are computed from the validated UTXO set; MWEB outputs are excluded because their values are not observable. Buckets are logarithmic in LTC and half-open on the upper bound.",
    kind: "distribution",
    controls: ["window"],
    grains: ["day"],
    unit: "count",
    appPath: "/xamine/charts/balance-distribution",
  },
  {
    slug: "supply-age-distribution",
    group: "supply",
    title: "Supply Age Distribution",
    summary: "Transparent spendable LTC supply grouped by UTXO age bands over time.",
    information:
      "HODL waves for Litecoin. Every spendable transparent coin is grouped by how long it has sat unmoved, from under a day to over seven years. The bands show whether old supply is waking up or settling down.",
    methodology:
      "The transparent UTXO set is bucketed into eleven coin-age bands at each period-end snapshot. Age is measured from the block that created the output. Values are shares of total spendable supply so the bands always sum to one. Readiness is fail-closed: a snapshot is only published once every block it depends on is beyond the reorg-safe depth.",
    kind: "bands",
    controls: ["grain", "range"],
    grains: ["day", "week", "month"],
    unit: "pct",
    appPath: "/xamine/charts/supply-age",
  },
  {
    slug: "mweb-balance",
    group: "mweb",
    title: "MWEB Balance",
    summary: "MWEB pool balance plus peg-in and peg-out flow.",
    information:
      "How much Litecoin lives inside the MWEB privacy extension. The pool balance is the running total pegged in minus pegged out; the flow bars show daily movement in and out of the extension block.",
    methodology:
      "Peg-ins are transparent outputs committed to the MWEB extension block; peg-outs are MWEB kernels releasing value back to transparent outputs. Net flow is peg-in minus peg-out per bucket, and the cumulative balance is the running sum reconciled against the extension block's total at bucket close. Individual MWEB transactions are not observable; only aggregate flows are reported.",
    kind: "timeseries",
    controls: ["grain", "range"],
    grains: ["day", "week", "month"],
    unit: "ltc",
    appPath: "/xamine/charts/mweb",
  },
];

export const TOOLS = [
  {
    slug: "address-linx",
    group: "address" as const,
    title: "Address LinX",
    summary: "Visualize address forensics across counterparties, flow patterns, and notable on-chain relationships.",
    href: "/xamine/tools/address-linx",
    appPath: "/xamine/diagrams/address-relationships",
  },
];

export const bySlug = (slug: string) => CHARTS.find((c) => c.slug === slug);
export const byGroup = (g: ChartGroup) => CHARTS.filter((c) => c.group === g);
