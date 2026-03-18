import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { type Device } from "../utils/models";
import DeviceSelect from "../components/DeviceSelect";
import { LineChart } from "@mui/x-charts";
import SiteModal from "../components/SiteModal";

function Summary() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");
  const [timeFrame, setTimeFrame] = useState<7 | 30 | 90>(7);

  const dayConverter: Record<number, string> = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };

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
      Record<number, Record<string, Record<string, number>>>
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
          number,
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
                const day = visit.startDateTime.getDay();

                // raw per-day / per-category / per-site breakdown (for filtering)
                timePerDayCategorySite[day] = timePerDayCategorySite[day] || {};
                timePerDayCategorySite[day][cat] =
                  timePerDayCategorySite[day][cat] || {};
                timePerDayCategorySite[day][cat][visit.siteUrl] =
                  (timePerDayCategorySite[day][cat][visit.siteUrl] || 0) +
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
      // Calculate ordered days from 6 days ago to today
      const today = new Date();
      const todayDayOfWeek = today.getDay();
      const orderedDaysOfWeek = [];
      for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
        const dayOfWeek = (todayDayOfWeek - daysAgo + 7) % 7;
        orderedDaysOfWeek.push(dayOfWeek);
      }

      const filteredTimePerCategoryCurr: Record<string, number> = {};

      const computedChartData = orderedDaysOfWeek.map((day) => {
        const obj: Record<string, any> = { day };

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
                          (rawTimePerDayCategorySite[day]?.[otherCat]?.[
                            otherSite
                          ] || 0),
                        0,
                      )
                    : rawTimePerDayCategorySite[day]?.[cat]?.[otherSite] || 0;
                sum += ms;
              });
            } else {
              const ms =
                cat === "Other"
                  ? otherCategories.reduce(
                      (acc, otherCat) =>
                        acc +
                        (rawTimePerDayCategorySite[day]?.[otherCat]?.[site] ||
                          0),
                      0,
                    )
                  : rawTimePerDayCategorySite[day]?.[cat]?.[site] || 0;
              sum += ms;
            }
          });

          obj[cat] = sum / (1000 * 60 * 60);
          filteredTimePerCategoryCurr[cat] =
            (filteredTimePerCategoryCurr[cat] || 0) + sum;
        });

        return obj;
      });

      setChartData(computedChartData);
      setTimePerCategoryCurr(filteredTimePerCategoryCurr);
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
    <>
      <h1>Summary</h1>
      <DeviceSelect
        devices={devices}
        selectedDevices={selectedDevices}
        setSelectedDevices={setSelectedDevices}
      />
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
      <p>What's New</p>
      <Box
        sx={{
          height: 300,
          backgroundColor: "#f0f0f0",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {Array.from(newSites).map((site) => (
            <li key={site}>{site}</li>
          ))}
        </ul>
      </Box>
      <p>Category Trends</p>
      <Box
        sx={{
          height: 300,
          backgroundColor: "#f0f0f0",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {Object.entries(timePerCategoryCurr).map(([category, time]) => (
            <li key={category}>
              {category}: {(time / (1000 * 60 * 60)).toFixed(2)} hrs
              {time > timePerCategoryPrev[category] ? (
                <ArrowUpwardIcon />
              ) : time < timePerCategoryPrev[category] ? (
                <ArrowDownwardIcon />
              ) : null}
            </li>
          ))}
        </ul>
      </Box>
      <p>Top 5 Sites</p>
      <Box
        sx={{
          height: 300,
          backgroundColor: "#f0f0f0",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {Object.entries(timePerSite)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([site, time]) => (
              <li key={site}>
                <SiteModal url={site} userId={userId} />:{" "}
                {(time / (1000 * 60 * 60)).toFixed(2)} hrs
              </li>
            ))}
        </ul>
      </Box>

      <LineChart
        dataset={chartData}
        xAxis={[
          {
            scaleType: "band",
            dataKey: "day",
            valueFormatter: (value) => dayConverter[value],
          },
        ]}
        series={
          chartData.length > 0
            ? Object.keys(chartData[0])
                .filter((k) => k !== "day" && (categoryFilters[k] ?? true))
                .map((cat) => ({ dataKey: cat, label: cat }))
            : []
        }
        height={275}
        yAxis={[{ label: "Hours Spent" }]}
      />
      <Box
        sx={{
          padding: 1,
          backgroundColor: "#f0f0f0",
          borderRadius: 2,
          display: "grid",
          gap: 1,
        }}
      >
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
      </Box>
    </>
  );
}

export default Summary;
