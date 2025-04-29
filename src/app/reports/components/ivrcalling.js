"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useEffect } from "react";

const IvrCalling = ({ data, total, exportCsv, selectedTab, setExportCsv }) => {
  useEffect(() => {
    if (exportCsv === "csv" && selectedTab?.id === 100) {
      exportTableToCSV();
    }
  }, [exportCsv]);

  const exportTableToCSV = (filename = "Ivr-Calling-Report.csv") => {
    let csv = [];
    const table = document.querySelector(".user-table-content");

    if (!table) return;

    // Extract headers
    const headers = Array.from(table.querySelectorAll("th")).map(
      (th) => `"${th.innerText}"`
    );
    csv.push(headers.join(","));

    // Extract table rows
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    rows.forEach((row) => {
      let cols = Array.from(row.querySelectorAll("td")).map((td) => {
        let text = td.innerText.trim();

        // Fix date format by adding an apostrophe before it
        if (text.match(/^\d{4}-\d{2}-\d{2}$/)) {
          text = `'${text}`; // Example: '2025-03-26
        }

        return `"${text}"`; // Ensure proper CSV formatting
      });
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
    setExportCsv("");
  };

  return (
    <TableContainer
      component={Paper}
      sx={{ marginTop: 2 }}
      className="user-table-container"
      style={{ maxHeight: "500px", overflowY: "auto" }}
    >
      <Table
        stickyHeader
        aria-label="Leads Table"
        className="user-table-content"
        sx={{
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
            <TableCell>Counselor Name</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Distinct Leads</TableCell>
            <TableCell>Outbound Call Attempts</TableCell>
            <TableCell>Outbound Successful Calls</TableCell>
            <TableCell>Outbound Call Duration</TableCell>
            <TableCell>Outbound Avg Call Duration</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.counselor_name}</TableCell>
                <TableCell>{row.call_date}</TableCell>
                <TableCell>{row.distinct_leads}</TableCell>
                <TableCell>{row.outbound_call_attempts}</TableCell>
                <TableCell>{row.outbound_successful_calls}</TableCell>
                <TableCell>{row.outbound_call_duration}</TableCell>
                <TableCell>{row.outbound_avg_call_duration}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No Data Available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableBody
          sx={{
            position: "sticky",
            bottom: 0,
            background: "#fff",
            boxShadow: "0 -2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <TableRow sx={{ fontWeight: "bold" }}>
            <TableCell>Total</TableCell>
            <TableCell>-</TableCell>
            <TableCell>{total.distinct_leads}</TableCell>
            <TableCell>{total.outbound_call_attempts}</TableCell>
            <TableCell>{total.outbound_successful_calls}</TableCell>
            <TableCell>{total.outbound_call_duration}</TableCell>
            <TableCell>{total.outbound_avg_call_duration}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default IvrCalling;
