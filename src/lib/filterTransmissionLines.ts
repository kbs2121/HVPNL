import type { TransmissionLine, TransmissionFilters } from "@/lib/types/transmissionLine";
import type { HierarchyFilters } from "@/lib/data/hierarchyFilters";
import { substationMatchesHierarchy } from "@/lib/data/hierarchyFilters";

export function matchesFilters(
  line: TransmissionLine,
  filters: TransmissionFilters,
  hierarchyFilters: HierarchyFilters
): boolean {
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const match =
      line.line_name.toLowerCase().includes(q) ||
      line.line_id.toLowerCase().includes(q) ||
      line.from_substation.name.toLowerCase().includes(q) ||
      line.to_substation.name.toLowerCase().includes(q);
    if (!match) return false;
  }

  if (filters.voltages.length > 0 && !filters.voltages.includes(line.voltage)) {
    return false;
  }

  if (hierarchyFilters.voltage !== "All" && line.voltage !== hierarchyFilters.voltage) {
    return false;
  }

  if (filters.health === "optimal" && line.health_score < 85) return false;
  if (filters.health === "warning" && (line.health_score < 60 || line.health_score >= 85))
    return false;
  if (filters.health === "critical" && line.health_score >= 60) return false;

  if (filters.issueCategory !== "all") {
    const hasIssue = line.issues.some((i) => i.type === filters.issueCategory);
    if (!hasIssue) return false;
  }

  const hasHierarchyFilter =
    hierarchyFilters.zone !== "All" ||
    hierarchyFilters.circle !== "All" ||
    hierarchyFilters.division !== "All" ||
    hierarchyFilters.substation !== "All";

  if (hasHierarchyFilter) {
    const fromMatch = substationMatchesHierarchy(
      line.from_substation.code,
      hierarchyFilters
    );
    const toMatch = substationMatchesHierarchy(
      line.to_substation.code,
      hierarchyFilters
    );
    if (!fromMatch && !toMatch) return false;
  }

  return true;
}
