import React, { useState } from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
} from '@tanstack/react-table';
import {
    ArrowUpDown,
    ChevronDown,
    MoreHorizontal,
    Search,
    AlertTriangle,
    Activity,
    CheckCircle2,
    Filter
} from 'lucide-react';
import { Incident } from '../types/incident';
import { format } from 'date-fns';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Checkbox from '@radix-ui/react-checkbox';

// --- UI Components (Simulating Shadcn) ---

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${className}`}>
            {children}
        </span>
    );
}

// --- Columns ---

// --- Props ---
interface AdminTableViewProps {
    incidents: Incident[];
    onDelete?: (id: string) => void;
    onViewOnMap?: (incident: Incident) => void;
    onViewDetails?: (incident: Incident) => void;
}

export function AdminTableView({ incidents, onDelete, onViewOnMap, onViewDetails }: AdminTableViewProps) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

    const columns = React.useMemo<ColumnDef<Incident>[]>(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox.Root
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    className="w-4 h-4 bg-slate-900 border border-slate-700 rounded flex items-center justify-center data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                >
                    <Checkbox.Indicator className="text-white"><CheckCircle2 className="w-3 h-3" /></Checkbox.Indicator>
                </Checkbox.Root>
            ),
            cell: ({ row }) => (
                <Checkbox.Root
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    className="w-4 h-4 bg-slate-900 border border-slate-700 rounded flex items-center justify-center data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                >
                    <Checkbox.Indicator className="text-white"><CheckCircle2 className="w-3 h-3" /></Checkbox.Indicator>
                </Checkbox.Root>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => <div className="font-mono text-xs text-slate-500">{row.getValue("id")}</div>,
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => {
                const cat = row.getValue("category") as string;
                return (
                    <Badge className="bg-slate-800 border-slate-700 text-slate-300 capitalize">
                        {cat}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "description",
            header: ({ column }) => {
                return (
                    <button
                        className="flex items-center gap-1 hover:text-white transition-colors"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Description
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </button>
                )
            },
            cell: ({ row }) => <div className="max-w-[300px] truncate font-medium text-slate-200" title={row.getValue("description")}>{row.getValue("description")}</div>,
        },
        {
            accessorKey: "urgency",
            header: "Status",
            cell: ({ row }) => {
                const urgency = row.getValue("urgency") as string;
                return (
                    <div className="flex items-center gap-2">
                        {urgency === 'critical' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        {urgency === 'medium' && <Activity className="w-4 h-4 text-orange-500" />}
                        {urgency === 'safe' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        <span className={`capitalize font-semibold ${urgency === 'critical' ? 'text-red-400' :
                            urgency === 'medium' ? 'text-orange-400' : 'text-green-400'
                            }`}>
                            {urgency}
                        </span>
                    </div>
                )
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: "confidence",
            header: "Confidence",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${row.getValue("confidence")}%` }} />
                    </div>
                    <span className="text-xs text-slate-400">{row.getValue("confidence")}%</span>
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const incident = row.original;
                return (
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-slate-800 text-slate-400 hover:text-white">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="end" className="w-[160px] bg-slate-900 border border-slate-800 rounded-lg p-1 shadow-xl z-50">
                            <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold text-slate-500">Actions</DropdownMenu.Label>
                            <DropdownMenu.Item
                                className="px-2 py-1.5 text-sm text-slate-200 outline-none cursor-pointer hover:bg-slate-800 rounded"
                                onClick={() => onViewDetails?.(incident)}
                            >
                                View Details
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                                className="px-2 py-1.5 text-sm text-slate-200 outline-none cursor-pointer hover:bg-slate-800 rounded"
                                onClick={() => onViewOnMap?.(incident)}
                            >
                                View on Map
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator className="h-px bg-slate-800 my-1" />
                            <DropdownMenu.Item
                                className="px-2 py-1.5 text-sm text-red-400 outline-none cursor-pointer hover:bg-red-500/10 rounded"
                                onClick={() => onDelete?.(incident.id)}
                            >
                                Delete Incident
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                )
            },
        },
    ], [onDelete, onViewOnMap, onViewDetails]);

    const table = useReactTable({
        data: incidents,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="w-full space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white">Incident Master List</h2>
                    <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">Admin View</Badge>
                </div>
            </div>

            <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2 relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        placeholder="Filter descriptions..."
                        value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("description")?.setFilterValue(event.target.value)
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 hover:bg-slate-800 cursor-pointer">
                                <Filter className="w-4 h-4" />
                                Columns <ChevronDown className="w-4 h-4 ml-1" />
                            </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="end" className="w-[150px] bg-slate-900 border border-slate-800 rounded-lg p-1 shadow-xl z-50">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenu.CheckboxItem
                                            key={column.id}
                                            className="px-2 py-1.5 text-sm text-slate-200 outline-none cursor-pointer hover:bg-slate-800 rounded flex items-center gap-2"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            <Checkbox.Root checked={column.getIsVisible()} className="w-3 h-3 border border-slate-600 rounded flex items-center justify-center">
                                                <Checkbox.Indicator><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /></Checkbox.Indicator>
                                            </Checkbox.Root>
                                            <span className="capitalize">{column.id}</span>
                                        </DropdownMenu.CheckboxItem>
                                    )
                                })}
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-950/80 text-slate-200 uppercase tracking-wider text-xs font-semibold border-b border-slate-800">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <th key={header.id} className="px-6 py-4">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </th>
                                    )
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-slate-800/50 transition-colors data-[state=selected]:bg-slate-800/80"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-6 py-4">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-xs text-slate-500">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <button
                        className="px-3 py-1 text-sm bg-slate-900 border border-slate-800 rounded disabled:opacity-50 text-slate-300 hover:bg-slate-800"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </button>
                    <button
                        className="px-3 py-1 text-sm bg-slate-900 border border-slate-800 rounded disabled:opacity-50 text-slate-300 hover:bg-slate-800"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}
