"use client";
import {
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,

} from "@mui/material";
import { useEffect } from "react";




const CounsellorWise = ({ data, total, exportCsv, selectedTab, setExportCsv }) => {


    useEffect(() => {
        if (exportCsv === "csv" && selectedTab?.id === 101) {
            exportTableToCSV()
        }
    }, [exportCsv])

    const exportTableToCSV = (filename = "Counsellor-Wise-Total-Call-Duration-Report.csv") => {
        let csv = [];
        const table = document.querySelector(".user-table-content");

        if (!table) return;

        // Extract headers
        const headers = Array.from(table.querySelectorAll("th")).map(th => `"${th.innerText}"`);
        csv.push(headers.join(","));

        // Extract table rows
        const rows = Array.from(table.querySelectorAll("tbody tr"));
        rows.forEach(row => {
            let cols = Array.from(row.querySelectorAll("td")).map(td => `"${td.innerText}"`);
            csv.push(cols.join(","));
        });

        // Convert CSV array to string
        const csvContent = "data:text/csv;charset=utf-8," + csv.join("\n");
        const encodedUri = encodeURI(csvContent);

        // Create a temporary download link
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExportCsv('')
    };



    return (
        <TableContainer component={Paper} sx={{ marginTop: 2 }} className="user-table-container"
            style={{ maxHeight: "500px", overflowY: "auto" }} >
            <Table stickyHeader
                aria-label="Leads Table"
                className="user-table-content" sx={{
                    borderCollapse: "collapse",
                    "& .MuiTable-root": {
                        border: "none",
                    },
                    "& td, & th": {
                        border: "1px solid lightgray",
                        padding: "12px", // Reduces padding to make rows smaller

                    },
                    "& th": {
                        borderBottom: "1px solid lightgray",
                        backgroundColor: "#F8F2E3",
                    },

                    "& .MuiTableContainer-root": {
                        border: "none",
                    },
                    "& .MuiTableHead-root": {
                        borderBottom: "1px solid lightgray", // Ensures the header bottom border is visible
                    },
                    "& .MuiTableContainer-root": {
                        border: "none",
                    },
                }}
                id="user-table-content"
            >
                <TableHead>
                    <TableRow>
                        <TableCell>Counselor name</TableCell>
                        <TableCell>Outbound call</TableCell>
                        <TableCell>Inbound Call</TableCell>
                        <TableCell>Total Call Durations</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data && data.length > 0 ? (data?.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell>{row.counselor_name}</TableCell>
                            <TableCell>{row.outbound_calls_duration}</TableCell>
                            <TableCell>{row.inbound_calls_duration}</TableCell>
                            <TableCell>{row.total_call_duration}</TableCell>
                        </TableRow>
                    ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                No Data Available
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                <TableBody sx={{ position: "sticky", bottom: 0, background: "#fff", boxShadow: "0 -2px 5px rgba(0,0,0,0.1)" }}>
                    <TableRow sx={{ fontWeight: "bold" }}>
                        <TableCell>Total</TableCell>
                        <TableCell>{total.outbound_calls_duration}</TableCell>
                        <TableCell>{total.inbound_calls_duration}</TableCell>
                        <TableCell>{total.total_call_duration}</TableCell>
                        {/* <TableCell>{total.attempts}</TableCell> */}
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default CounsellorWise