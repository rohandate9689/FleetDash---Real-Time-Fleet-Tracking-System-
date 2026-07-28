import "../../styles/dashboard.css";
import "../../styles/alertPanel.css";

function AlertPanel({ alerts = [] }) {
  return (
    <div className="section-card">

      <div className="section-header">
        <h2 className="section-title">
          <span
            className="section-title-dot"
            style={{ backgroundColor: "#ef4444" }}
          />
          Recent Alerts
        </h2>

        <span className="section-tag">
          {alerts.length} Active {alerts.length === 1 ? "Alert" : "Alerts"}
        </span>
      </div>

      <div className="alert-list">

        {alerts.length === 0 ? (

          <div className="alert-empty">
            No recent alerts
          </div>

        ) : (

          alerts.map((alert) => (

            <div className="alert-item" key={alert._id}>

              <div className="alert-content-left">

                <div className="alert-meta">

                  <span className="alert-vehicle">
                    {alert.vehicleId}
                  </span>

                  <span className="alert-meta-dot"></span>

                  <span className="alert-driver">
                    {alert.geofenceName || "System"}
                  </span>

                  <span className="alert-meta-dot"></span>

                  <span className="alert-type">
                    {alert.type}
                  </span>

                </div>

                <p className="alert-message">
                  {alert.message}
                </p>

              </div>

              <div className="alert-content-right">

                <span
                  className={`severity-badge ${
                    alert.type === "ENTRY"
                      ? "success"
                      : alert.type === "EXIT"
                      ? "danger"
                      : "warning"
                  }`}
                >
                  {alert.type}
                </span>

                <span className="alert-time">
                  {new Date(alert.createdAt).toLocaleString()}
                </span>

              </div>

            </div>

          ))

        )}

      </div>

    </div>
  );
}

export default AlertPanel;