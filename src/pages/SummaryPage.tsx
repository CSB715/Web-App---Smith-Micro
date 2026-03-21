import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TrendingUp from "@mui/icons-material/TrendingUp";
import TrendingDown from "@mui/icons-material/TrendingDown";
import TrendingFlat from "@mui/icons-material/TrendingFlat";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import {
  getAuthInstance,
  GetCategorization,
  GetDevices,
  GetVisits,
} from "../utils/firestore";
import { useNavigate } from "react-router";
import { type Categorization, type Visit } from "../utils/models";
import { getDisplayUrl } from "../utils/urls";
import { type Device } from "../utils/models";
import DeviceSelect from "../components/DeviceSelect";
import { LineChart } from "@mui/x-charts";
import SiteModal from "../components/SiteModal";

function Summary() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");
  const [timeFrame, setTimeFrame] = useState<7 | 30 | 90>(7);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuthInstance(), (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate("/login", { replace: true });
      }
    });

    return unsubscribe;
  }, [navigate]);

  function useData() {
    const [timePerCategoryCurr, setTimePerCategoryCurr] = useState<
      Record<string, number>
    >({});
    const [timePerCategoryPrev, setTimePerCategoryPrev] = useState<
      Record<string, number>
    >({});
    const [timePerSite, setTimePerSite] = useState<Record<string, number>>({});
    const [newSites, setNewSites] = useState<Set<string>>(new Set());
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
    const [chartData, setChartData] = useState<Record<string, any>[]>([]);
    const [categoryFilters, setCategoryFilters] = useState<
      Record<string, boolean>
    >({});
    const [siteFilters, setSiteFilters] = useState<Record<string, boolean>>({});
    const [rawTimePerDayCategorySite, setRawTimePerDayCategorySite] = useState<
      Record<string, Record<string, Record<string, number>>>
    >({});

    const displayInfo = useMemo(() => {
      const categoryTotals: Record<string, number> = {};
      const categorySiteTotals: Record<string, Record<string, number>> = {};

      Object.values(rawTimePerDayCategorySite).forEach((catMap) => {
        Object.entries(catMap).forEach(([cat, siteMap]) => {
          Object.entries(siteMap).forEach(([site, ms]) => {
            categoryTotals[cat] = (categoryTotals[cat] || 0) + ms;
            categorySiteTotals[cat] = categorySiteTotals[cat] || {};
            categorySiteTotals[cat][site] =
              (categorySiteTotals[cat][site] || 0) + ms;
          });
        });
      });

      const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .map(([cat]) => cat);
      const topCategories = sortedCategories.slice(0, 3);
      const otherCategories = sortedCategories.slice(3);
      const displayCategories = [...topCategories];
      if (otherCategories.length > 0) displayCategories.push("Other");

      const computeSitesForCategory = (siteTotals: Record<string, number>) => {
        const sortedSites = Object.entries(siteTotals)
          .sort((a, b) => b[1] - a[1])
          .map(([site]) => site);
        const topSites = sortedSites.slice(0, 4);
        if (sortedSites.length > 4) topSites.push("Other");
        return topSites;
      };

      const displayCategorySites: Record<string, string[]> = {};

      displayCategories.forEach((cat) => {
        if (cat === "Other") {
          const otherSiteTotals: Record<string, number> = {};
          otherCategories.forEach((otherCat) => {
            const sites = categorySiteTotals[otherCat] || {};
            Object.entries(sites).forEach(([site, ms]) => {
              otherSiteTotals[site] = (otherSiteTotals[site] || 0) + ms;
            });
          });
          displayCategorySites[cat] = computeSitesForCategory(otherSiteTotals);
        } else {
          displayCategorySites[cat] = computeSitesForCategory(
            categorySiteTotals[cat] || {},
          );
        }
      });

      return {
        displayCategories,
        displayCategorySites,
        otherCategories,
        categorySiteTotals,
      };
    }, [rawTimePerDayCategorySite]);

    useEffect(() => {
      if (!userId) return;

      async function load() {
        const devicesData = await GetDevices(userId);
        const normalizedDevices: Device[] = devicesData.map((d) => ({
          id: d.id,
          name: d.data.name,
        }));
        setDevices(normalizedDevices);
        setSelectedDevices(normalizedDevices);
      }

      load();
    }, [userId]);

    useEffect(() => {
      if (!userId) return;

      async function load() {
        const visitsData = await Promise.all(
          selectedDevices
            .filter((d) => d.id !== "__all__")
            .map((d) => GetVisits(userId, d.id)),
        );

        const normalizedVisits: Visit[] = visitsData.flat().map((v) => ({
          id: v.id,
          siteUrl: getDisplayUrl(v.data.siteUrl).replace(/^www\./, ""), // remove www. for better display
          startDateTime: new Date(v.data.startDateTime),
          endDateTime: new Date(v.data.endDateTime),
        }));

        const timePerCategoryCurr: Record<string, number> = {};
        const timePerCategoryPrev: Record<string, number> = {};
        const timePerSite: Record<string, number> = {};
        const sitesVisitedCurr = new Set<string>();
        const sitesVisitedPrev = new Set<string>();
        const timePerDayCategorySite: Record<
          string,
          Record<string, Record<string, number>>
        > = {};
        const categorySites: Record<string, Set<string>> = {};

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - timeFrame);

        await Promise.all(
          normalizedVisits.map(async (visit) => {
            const timeSpent =
              visit.endDateTime.getTime() - visit.startDateTime.getTime();

            const categorizationData = await GetCategorization(visit.siteUrl);

            let normalizedCategorization: Categorization;

            if (categorizationData) {
              normalizedCategorization = {
                siteUrl: categorizationData.id,
                category: categorizationData.data.category,
                is_flagged: categorizationData.data.is_flagged,
              };
            } else {
              normalizedCategorization = {
                siteUrl: visit.siteUrl,
                category: ["Unknown"],
                is_flagged: false,
              };
            }

            if (visit.startDateTime >= cutoffDate) {
              normalizedCategorization.category.forEach((cat) => {
                timePerCategoryCurr[cat] =
                  (timePerCategoryCurr[cat] || 0) + timeSpent;
                const dayKey = visit.startDateTime.toISOString().slice(0, 10); // YYYY-MM-DD

                // raw per-day / per-category / per-site breakdown (for filtering)
                timePerDayCategorySite[dayKey] =
                  timePerDayCategorySite[dayKey] || {};
                timePerDayCategorySite[dayKey][cat] =
                  timePerDayCategorySite[dayKey][cat] || {};
                timePerDayCategorySite[dayKey][cat][visit.siteUrl] =
                  (timePerDayCategorySite[dayKey][cat][visit.siteUrl] || 0) +
                  timeSpent;

                // track available sites per category
                categorySites[cat] = categorySites[cat] || new Set();
                categorySites[cat].add(visit.siteUrl);
              });
              sitesVisitedCurr.add(visit.siteUrl);
              timePerSite[visit.siteUrl] =
                (timePerSite[visit.siteUrl] || 0) + timeSpent;
            } else {
              normalizedCategorization.category.forEach((cat) => {
                timePerCategoryPrev[cat] =
                  (timePerCategoryPrev[cat] || 0) + timeSpent;
              });
              sitesVisitedPrev.add(visit.siteUrl);
            }
          }),
        );
        const newSites = new Set<string>(
          [...sitesVisitedCurr].filter((x) => !sitesVisitedPrev.has(x)),
        );
        const allCategories = new Set<string>();
        Object.keys(categorySites).forEach((cat) => allCategories.add(cat));

        setTimePerCategoryCurr(timePerCategoryCurr);
        setTimePerCategoryPrev(timePerCategoryPrev);
        setTimePerSite(timePerSite);
        setNewSites(newSites);
        setRawTimePerDayCategorySite(timePerDayCategorySite);
        const normalizedCategorySites = Object.fromEntries(
          Object.entries(categorySites).map(([cat, sites]) => [
            cat,
            Array.from(sites).sort(),
          ]),
        );

        // Prepare the initial filter state for all categories + sites.
        setCategoryFilters((prev) => {
          const next: Record<string, boolean> = {};
          Object.keys(normalizedCategorySites).forEach((cat) => {
            next[cat] = prev[cat] ?? true;
          });
          return next;
        });
        setSiteFilters((prev) => {
          const next: Record<string, boolean> = {};
          Object.entries(normalizedCategorySites).forEach(([cat, sites]) => {
            sites.forEach((site) => {
              const key = `${cat}||${site}`;
              next[key] = prev[key] ?? true;
            });
          });
          return next;
        });
      }

      load();
    }, [userId, timeFrame, selectedDevices]);

    const {
      displayCategories,
      displayCategorySites,
      otherCategories,
      categorySiteTotals,
    } = displayInfo;

    useEffect(() => {
      // Initialize filter state when the set of displayed categories/sites changes
      setCategoryFilters((prev) => {
        const next: Record<string, boolean> = {};
        displayCategories.forEach((cat) => {
          next[cat] = prev[cat] ?? true;
        });
        return next;
      });

      setSiteFilters((prev) => {
        const next: Record<string, boolean> = {};
        Object.entries(displayCategorySites).forEach(([cat, sites]) => {
          sites.forEach((site) => {
            const key = `${cat}||${site}`;
            next[key] = prev[key] ?? true;
          });
        });
        return next;
      });
    }, [displayCategories, displayCategorySites]);

    useEffect(() => {
      // Calculate ordered dates from (timeFrame - 1) days ago through today
      const today = new Date();
      const orderedDateKeys: string[] = [];
      for (let daysAgo = timeFrame - 1; daysAgo >= 0; daysAgo--) {
        const d = new Date(today);
        d.setDate(d.getDate() - daysAgo);
        orderedDateKeys.push(d.toISOString().slice(0, 10));
      }

      const computedChartData = orderedDateKeys.map((dateKey) => {
        const obj: Record<string, any> = { day: dateKey };

        displayCategories.forEach((cat) => {
          if (!categoryFilters[cat]) return;

          const sites = displayCategorySites[cat] || [];
          const topSites = sites.filter((s) => s !== "Other");
          let sum = 0;

          sites.forEach((site) => {
            const key = `${cat}||${site}`;
            if (!siteFilters[key]) return;

            if (site === "Other") {
              const allSites =
                cat === "Other"
                  ? otherCategories.flatMap((otherCat) =>
                      Object.keys(categorySiteTotals[otherCat] || {}),
                    )
                  : Object.keys(categorySiteTotals[cat] || {});

              const otherSites = allSites.filter((s) => !topSites.includes(s));
              otherSites.forEach((otherSite) => {
                const ms =
                  cat === "Other"
                    ? otherCategories.reduce(
                        (acc, otherCat) =>
                          acc +
                          (rawTimePerDayCategorySite[dateKey]?.[otherCat]?.[
                            otherSite
                          ] || 0),
                        0,
                      )
                    : rawTimePerDayCategorySite[dateKey]?.[cat]?.[otherSite] ||
                      0;
                sum += ms;
              });
            } else {
              const ms =
                cat === "Other"
                  ? otherCategories.reduce(
                      (acc, otherCat) =>
                        acc +
                        (rawTimePerDayCategorySite[dateKey]?.[otherCat]?.[
                          site
                        ] || 0),
                      0,
                    )
                  : rawTimePerDayCategorySite[dateKey]?.[cat]?.[site] || 0;
              sum += ms;
            }
          });

          obj[cat] = sum / (1000 * 60 * 60);
        });

        return obj;
      });

      setChartData(computedChartData);
    }, [
      rawTimePerDayCategorySite,
      displayCategories,
      displayCategorySites,
      otherCategories,
      categorySiteTotals,
      categoryFilters,
      siteFilters,
    ]);

    return {
      timePerCategoryCurr,
      timePerSite,
      timePerCategoryPrev,
      newSites,
      devices,
      selectedDevices,
      setSelectedDevices,
      chartData,
      categoryFilters,
      setCategoryFilters,
      siteFilters,
      setSiteFilters,
      displayCategories,
      displayCategorySites,
    };
  }

  const {
    timePerCategoryCurr,
    timePerSite,
    timePerCategoryPrev,
    newSites,
    devices,
    selectedDevices,
    setSelectedDevices,
    chartData,
    categoryFilters,
    setCategoryFilters,
    siteFilters,
    setSiteFilters,
    displayCategories,
    displayCategorySites,
  } = useData();

  return (
    <Box
      component="main"
      role="main"
      aria-labelledby="summary-title"
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        px: 2.5,
      }}
    >
      {/* Page header */}
      <Box component="header" aria-label="page header">
        {/* ── Title ── */}
        <Typography
          variant="h1"
          sx={{
            fontWeight: "bold",
            letterSpacing: "-0.02em",
            mb: 3,
            color: "#01579b",
            alignSelf: "center",
            textAlign: "center",
            fontSize: "2rem",
          }}
        >
          Summary
        </Typography>
      </Box>

      {/* ── Stats bar ── */}
      <Paper
        role="region"
        aria-label="summary statistics"
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: "row",
          bgcolor: "primary.main",
          borderRadius: 2.5,
          overflow: "hidden",
          mb: 3.5,
          boxShadow: "0 4px 20px rgba(0,0,0,0.13)",
        }}
      >
        {[
          {
            value: Object.values(timePerSite)
              .reduce((sum, h) => (sum + h) / (1000 * 60 * 60), 0)
              .toFixed(2),
            label: "Hours",
          },
          {
            value: selectedDevices.some((d) => d.id === "__all__")
              ? selectedDevices.length - 1
              : selectedDevices.length,
            label: "Devices",
          },
        ].map((stat, i) => (
          <Box
            key={stat.label}
            sx={{
              flex: 1,
              px: 1.5,
              py: 2,
              borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.18)" : "none",
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "1.6rem",
                fontWeight: 300,
                color: "#fff",
                lineHeight: 1,
                mb: 0.5,
              }}
            >
              {stat.value}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.55rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "white",
              }}
            >
              {stat.label}
            </Typography>
          </Box>
        ))}
      </Paper>

      <Divider sx={{ mb: 3 }} />

      {/* ── Device filter ── */}
      <Box sx={{ mb: 4 }} component="section" role="region" aria-label="device filter">
        <Typography
          variant="caption"
          sx={{
            fontFamily: "monospace",
            fontSize: "0.68rem",
            letterSpacing: "0.11em",
            textTransform: "uppercase",
            color: "black",
            opacity: 0.6,
            display: "block",
            mb: 1.5,
          }}
        >
          Filter by device
        </Typography>
        <DeviceSelect
          devices={devices}
          selectedDevices={selectedDevices}
          setSelectedDevices={setSelectedDevices}
        />
      </Box>

      {/* ── Timeframe ── */}
      <Box sx={{ mb: 3 }} component="section" role="region" aria-label="timeframe selection">
        <ToggleButtonGroup
          value={timeFrame}
          exclusive
          onChange={(_, newTimeFrame) => {
            if (newTimeFrame !== null) {
              setTimeFrame(newTimeFrame);
            }
          }}
        >
          <ToggleButton value={7}>7 Days</ToggleButton>
          <ToggleButton value={30}>30 Days</ToggleButton>
          <ToggleButton value={90}>90 Days</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* ── What's New ── */}
      <Box sx={{ mb: 3 }} component="section" role="region" aria-label="what's new" >
        <Typography variant="h2" sx={{ mb: 1, fontSize: "1.5rem" }}>
          What's New
        </Typography>
        <Paper
          sx={{
            px: 2,
            py: 1.5,
            backgroundColor: "background.paper",
            borderRadius: 2,
          }}
        >
          {newSites.size === 0 ? (
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontFamily: "monospace" }}
            >
              No new sites this period.
            </Typography>
          ) : (
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
              {Array.from(newSites).map((site) => (
                <Box
                  component="li"
                  key={site}
                  sx={{ fontFamily: "monospace", fontSize: "0.9rem" }}
                >
                  <SiteModal url={site} userId={userId} />
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>

      {/* ── Category Trends ── */}
      <Box sx={{ mb: 3 }} component="section" role="region" aria-label="category trends">
        <Typography variant="h2" sx={{ mb: 1, fontSize: "1.5rem" }}>
          Category Trends
        </Typography>
        <Paper
          sx={{
            px: 2,
            py: 1.5,
            backgroundColor: "background.paper",
            borderRadius: 2,
          }}
        >
          {Object.entries(timePerCategoryCurr).length === 0 ? (
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontFamily: "monospace" }}
            >
              No category data available.
            </Typography>
          ) : (
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
              {Object.entries(timePerCategoryCurr)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, time]) => {
                  const prevTime = timePerCategoryPrev[cat] || 0;
                  const trend =
                    prevTime > time
                      ? "decrease"
                      : prevTime < time
                        ? "increase"
                        : "same";
                  const hours = (time / (1000 * 60 * 60)).toFixed(2);
                  const prevHours = (prevTime / (1000 * 60 * 60)).toFixed(2);
                  return (
                    <Box
                      component="li"
                      key={cat}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontFamily: "monospace",
                        fontSize: "0.9rem",
                        py: 0.5,
                      }}
                    >
                      <Typography>{cat}</Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {trend === "increase" && (
                          <TrendingUp color="action" />
                        )}
                        {trend === "decrease" && (
                          <TrendingDown color="action" />
                        )}
                        {trend === "same" && <TrendingFlat color="action" />}
                        <Typography sx={{ ml: 1 }}>
                          {hours} hrs ({prevHours} hrs prev)
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
            </Box>
          )}
        </Paper>
      </Box>

      {/* ── Top Sites ── */}
      <Box sx={{ mb: 3 }} component="section" role="region" aria-label="top sites">
        <Typography variant="h2" sx={{ mb: 1, fontSize: "1.5rem" }}>
          Top Sites
        </Typography>
        <Paper
          sx={{
            px: 2,
            py: 1.5,
            backgroundColor: "background.paper",
            borderRadius: 2,
          }}
        >
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
            {Object.entries(timePerSite)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([site, time]) => (
                <Box
                  component="li"
                  key={site}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontFamily: "monospace",
                    fontSize: "0.9rem",
                    py: 0.5,
                  }}
                >
                  <SiteModal url={site} userId={userId} />
                  <Box component="span" sx={{ opacity: 0.7 }}>
                    {(time / (1000 * 60 * 60)).toFixed(2)} hrs
                  </Box>
                </Box>
              ))}
          </Box>
        </Paper>
      </Box>

      {/* ── Hours Spent ── */}
      <Box sx={{ mb: 3 }} component="section" role="region" aria-label="hours spent graph">
        <Typography variant="h2" sx={{ mb: 1, fontSize: "1.5rem" }}>
          Hours Online Over The Past {timeFrame} Days
        </Typography>
        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: "background.paper",
          }}
        >
          {/* ── Graph ── */}
          <LineChart
            dataset={chartData}
            xAxis={[
              {
                scaleType: "band",
                dataKey: "day",
                valueFormatter: (value) => {
                  try {
                    return new Date(value).toLocaleDateString();
                  } catch {
                    return String(value);
                  }
                },
              },
            ]}
            series={
              chartData.length > 0
                ? Object.keys(chartData[0])
                    .filter(
                      (k) => k !== "day" && (categoryFilters[k] ?? true),
                    )
                    .map((cat) => ({ dataKey: cat, label: cat }))
                : []
            }
            height={275}
            yAxis={[{ label: "Hours Spent" }]}
          />

          {/* ── Filters ── */}
          {displayCategories.map((cat) => {
            const sites = displayCategorySites[cat] || [];
            return (
              <Accordion key={cat} disableGutters>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`${cat}-content`}
                  id={`${cat}-header`}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={categoryFilters[cat] ?? true}
                        onChange={() =>
                          setCategoryFilters((prev) => ({
                            ...prev,
                            [cat]: !prev[cat],
                          }))
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    }
                    label={cat}
                    sx={{ width: "100%" }}
                  />
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    {sites.map((site) => {
                      const key = `${cat}||${site}`;
                      return (
                        <FormControlLabel
                          key={key}
                          control={
                            <Checkbox
                              checked={siteFilters[key] ?? true}
                              disabled={!categoryFilters[cat]}
                              onChange={() =>
                                setSiteFilters((prev) => ({
                                  ...prev,
                                  [key]: !prev[key],
                                }))
                              }
                            />
                          }
                          label={site}
                        />
                      );
                    })}
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Paper>
      </Box>
    </Box>
  );
}

export default Summary;
