import SiteDashboard from "./SiteDashboard";
import { getSiteById } from "@/lib/sites";

const MadinahDashboard = () => <SiteDashboard site={getSiteById("madinah")!} />;

export default MadinahDashboard;
