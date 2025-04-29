"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
} from "@mui/material";
import { useEffect } from "react";

const IvrDump = ({ data, exportCsv, selectedTab, setExportCsv }) => {
  useEffect(() => {
    if (exportCsv === "csv" && selectedTab?.id === 102) {
      exportTableToCSV();
    }
  }, [exportCsv]);

  const exportTableToCSV = (filename = "IVR-Dump-Report.csv") => {
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

  const statusChip = (status) => {
    return (
      <>
        {status === "New" && (
          <Chip
            label="New"
            sx={{
              backgroundColor: "#E5FFEB",
              color: "#00DA07",
              fontWeight: "bold",
            }}
          />
        )}
        {status === "Re-allocate" && (
          <Chip
            label="Re-allocate"
            sx={{
              backgroundColor: "#F0EFFF",
              color: "#0017E4",
              fontWeight: "bold",
            }}
          />
        )}
        {status === "Enrolled" && (
          <Chip
            label="Enrolled"
            sx={{
              backgroundColor: "#FFF8E3",
              color: "#FFC107",
              fontWeight: "bold",
            }}
          />
        )}
      </>
    );
  };

  const subStatusChip = (substatus) => {
    const getDotColor = (status) => {
      switch (status) {
        case "Issues (alert)":
          return "#00DA07"; // Green
        case "Different University":
          return "#0017E4"; // blue
        case "Fee paid":
          return "#FFC107"; // yellow
        default:
          return "#808080"; // Gray (for unknown statuses)
      }
    };

    return (
      <Stack spacing={1}>
        <Chip
          label={substatus}
          icon={
            <span
              style={{
                width: 8,
                height: 8,
                backgroundColor: getDotColor(substatus),
                borderRadius: "50%",
                display: "inline-block",
              }}
            />
          }
          sx={{
            backgroundColor: "white",
            border: "1px solid #ddd",
            fontWeight: "bold",
          }}
        />
      </Stack>
    );
  };

  return (
    <TableContainer
      component={Paper}
      sx={{ marginTop: 2 }}
      className="user-table-container"
      style={{
        maxHeight: "500px",
        overflow: "auto",
        width: "100%",
        whiteSpace: "nowrap",
      }}
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
            <TableCell sx={{ minWidth: "220px" }}>Counselor Name</TableCell>
            <TableCell sx={{ minWidth: "220px" }}>Student Name</TableCell>
            <TableCell sx={{ minWidth: "250px" }}>Email</TableCell>
            <TableCell sx={{ minWidth: "150px" }}>Contact Number</TableCell>
            <TableCell sx={{ minWidth: "150px" }}>Created On</TableCell>
            <TableCell sx={{ minWidth: "120px" }}>Status</TableCell>
            <TableCell sx={{ minWidth: "150px" }}>Sub-Status</TableCell>
            <TableCell sx={{ minWidth: "200px" }}>Channel</TableCell>
            <TableCell sx={{ minWidth: "200px" }}>Source</TableCell>
            <TableCell sx={{ minWidth: "250px" }}>University</TableCell>
            <TableCell sx={{ minWidth: "250px" }}>Course</TableCell>
            <TableCell sx={{ minWidth: "100px" }}>TAT</TableCell>
            <TableCell sx={{ minWidth: "100px" }}>Call Aging</TableCell>
            <TableCell sx={{ minWidth: "150px" }}>
              Call Attempt Count Aging
            </TableCell>
            <TableCell sx={{ minWidth: "150px" }}>
              Call Connected Count
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data && data?.length > 0 ? (
            data?.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.counselor_name}</TableCell>
                <TableCell>{row.student_name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.contact_number}</TableCell>
                <TableCell>{row?.lead_creation_date?.split(" ")[0]}</TableCell>
                <TableCell>{statusChip(row.lead_status)}</TableCell>
                <TableCell>{subStatusChip(row.lead_sub_status)}</TableCell>
                <TableCell>{row.channel}</TableCell>
                <TableCell>{row.source}</TableCell>
                <TableCell>{row.institution}</TableCell>
                <TableCell>{row.course}</TableCell>
                <TableCell>{row.tat}</TableCell>
                <TableCell>{row.call_aging}</TableCell>
                <TableCell>{row.call_attempt_count_aging}</TableCell>
                <TableCell>{row.call_connected_count}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={15} align="center">
                No Data Available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default IvrDump;
