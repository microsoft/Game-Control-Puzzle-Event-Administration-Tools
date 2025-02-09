import { Table } from '@tanstack/table-core';
import { flexRender } from '@tanstack/react-table';
import { Table as BTable } from 'react-bootstrap';

type Props = Readonly<{
    table: Table<any>;
}>;

export const TanstackTable = ({ table }: Props) => {
    return (
        <BTable bordered>
            <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <th key={header.id} colSpan={header.colSpan}>
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody>
                {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => {
                            return <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>;
                        })}
                    </tr>
                ))}
            </tbody>
        </BTable>
    );
};
