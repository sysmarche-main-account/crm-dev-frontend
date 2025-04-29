"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";
import { East } from "@mui/icons-material";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { useTranslations } from "next-intl";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { getAllLeadsAction } from "@/app/actions/leadActions";
import { decryptClient } from "@/utils/decryptClient";

const NewLeads = () => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const [loading, setLoading] = useState({
    alleads: false,
  });
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState("right");
  const [dataArr, setDataArr] = useState(null);

  const todaysDate = new Date().toLocaleDateString("en-CA");

  const weekStartDate = new Date(
    new Date().setDate(
      new Date().getDate() -
        new Date().getDay() +
        (new Date().getDay() === 0 ? -6 : 1)
    )
  ).toLocaleDateString("en-CA");

  const weekEndDate = new Date(
    new Date().setDate(
      new Date().getDate() -
        new Date().getDay() +
        (new Date().getDay() === 0 ? -6 : 1) +
        6
    )
  ).toLocaleDateString("en-CA");

  const getAllLeadsData = async () => {
    setLoading((prev) => ({ ...prev, alleads: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      filter: {
        date_filters: [
          {
            // field: dateType,
            field: "created_at",
            from: selected === "right" ? weekStartDate : todaysDate,
            to: selected === "right" ? weekEndDate : todaysDate,
          },
        ],
        field_filters: [
          {
            field: "lead_status",
            value: 122,
          },
        ],
      },
    };
    console.log("body allLeads", reqbody);

    try {
      const result = await getAllLeadsAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final allLeads", decrypted);

        setData(decrypted);
        const { data, ...pageData } = decrypted;
        setDataArr(data);
        setLoading((prev) => ({ ...prev, alleads: false }));
        // setBigLoading(false);
      } else {
        console.error(result.error);
        if (result.error.status === 500) {
          await logout();
        } else if (typeof result.error.message === "string") {
          showSnackbar({
            message: `${result.error.message}`,
            severity: "error",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        } else if (
          typeof result.error.message === "object" &&
          result.error.message !== null
        ) {
          let errValues = Object.values(result.error.message);
          if (errValues.includes("Token expired")) {
            getToken();
            window.location.reload();
          } else if (errValues.length > 0) {
            errValues.map((errmsg) =>
              showSnackbar({
                message: `${errmsg}`,
                severity: "error",
                anchorOrigin: { vertical: "top", horizontal: "center" },
              })
            );
          }
        }
        setLoading((prev) => ({ ...prev, alleads: false }));
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, alleads: false }));
    }
  };

  useEffect(() => {
    getAllLeadsData();
  }, [selected]);

  return (
    <div className="newLeadsContainer">
      <div className="heading">
        <div>
          <p>New Leads</p>
          {loading.alleads ? (
            <CircularProgress size={30} sx={{ color: "#30327b" }} />
          ) : (
            <p className="leads">{data?.filter_count || "0"}</p>
          )}
        </div>
        <div className="leadsAndchips">
          <div className="chipContainer">
            <Chip
              className={`chip ${selected === "left" ? "selected" : ""}`}
              label="Today"
              size="small"
              onClick={() => setSelected("left")}
            />
            <Chip
              className={`chip ${selected === "right" ? "selected" : ""}`}
              label="This Week"
              size="small"
              onClick={() => setSelected("right")}
            />
          </div>
          <div>
            <Link href="/leads" className="link">
              Go to Leads
              <East color="#00bc70" />
            </Link>
          </div>
        </div>
      </div>
      <div className="Content">
        {loading.alleads ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress size={50} sx={{ color: "#30327b" }} />
          </div>
        ) : (
          <TableContainer
            className="custom-scrollbar"
            component={Paper}
            style={{ maxHeight: "100%", height: loading.alleads && "100%" }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Added on</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Source</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataArr?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      align="center"
                      style={{ padding: "20px", textAlign: "center" }}
                    >
                      No new leads
                    </TableCell>
                  </TableRow>
                ) : (
                  dataArr?.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row?.full_name || "-"}</TableCell>
                      <TableCell style={{ width: 75 }}>
                        {row?.created_at
                          ?.split(" ")[0]
                          .split("-")
                          .reverse()
                          .join("-") || "-"}
                      </TableCell>
                      <TableCell>{row?.source_medium?.name || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </div>
  );
};

export default NewLeads;
