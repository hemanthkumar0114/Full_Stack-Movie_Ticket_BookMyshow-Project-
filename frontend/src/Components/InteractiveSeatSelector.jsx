import { useState, useEffect, useRef, useCallback } from "react";

function InteractiveSeatSelector({ seatMapData, selectedSeatIds = [], onToggleSeat }) {
  const [viewMode, setViewMode] = useState("standard");
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const seatsPhysicsState = useRef([]);
  const mousePos = useRef({ x: -1000, y: -1000, active: false });

  const tiers = seatMapData?.tiers || [];
  const allSeats = tiers.flatMap((t) => t.seats || []);
  const initializePhysicsParticles = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const width = canvas.width || 800;
    const height = canvas.height || 500;

    seatsPhysicsState.current = allSeats.map((seat, index) => {
      const radius = seat.tierCategory === "RECLINER" ? 22 : seat.tierCategory === "PRIME" ? 19 : 17;
      const angle = (index / Math.max(allSeats.length, 1)) * Math.PI * 2;
      const spreadX = width / 2 + Math.cos(angle) * (width * 0.32) + (Math.random() - 0.5) * 40;
      const spreadY = height / 2 + Math.sin(angle) * (height * 0.32) + (Math.random() - 0.5) * 40;

      return {
        ...seat,
        x: Math.max(radius + 10, Math.min(width - radius - 10, spreadX)),
        y: Math.max(radius + 10, Math.min(height - radius - 10, spreadY)),
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        radius,
        baseRadius: radius,
        hovered: false,
        pulseOffset: Math.random() * Math.PI * 2,
        color:
          seat.tierCategory === "RECLINER"
            ? "#E5A00D"
            : seat.tierCategory === "PRIME"
            ? "#3B82F6"
            : "#10B981"
      };
    });
  }, [allSeats]);
  useEffect(() => {
    if (viewMode !== "interactive" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const updateCanvasDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      initializePhysicsParticles();
    };

    updateCanvasDimensions();
    window.addEventListener("resize", updateCanvasDimensions);
    return () => window.removeEventListener("resize", updateCanvasDimensions);
  }, [viewMode, initializePhysicsParticles]);
  useEffect(() => {
    if (viewMode !== "interactive" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let isMounted = true;

    const renderPhysicsFrame = () => {
      if (!isMounted) return;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      ctx.fillStyle = "#0F1017";
      ctx.fillRect(0, 0, width, height);
      const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.65);
      bgGradient.addColorStop(0, "rgba(59, 130, 246, 0.08)");
      bgGradient.addColorStop(1, "rgba(15, 16, 23, 0.95)");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      const particles = seatsPhysicsState.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (mousePos.current.active) {
          const dx = mousePos.current.x - p.x;
          const dy = mousePos.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxInfluence = 160;

          if (dist > 0 && dist < maxInfluence) {
            const force = ((maxInfluence - dist) / maxInfluence) * 0.45;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;
        if (p.x - p.radius < 10) {
          p.x = p.radius + 10;
          p.vx = Math.abs(p.vx) * 0.85;
        } else if (p.x + p.radius > width - 10) {
          p.x = width - p.radius - 10;
          p.vx = -Math.abs(p.vx) * 0.85;
        }

        if (p.y - p.radius < 10) {
          p.y = p.radius + 10;
          p.vy = Math.abs(p.vy) * 0.85;
        } else if (p.y + p.radius > height - 10) {
          p.y = height - p.radius - 10;
          p.vy = -Math.abs(p.vy) * 0.85;
        }
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p2.x - p.x;
          const cdy = p2.y - p.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          const minDist = p.radius + p2.radius + 4;

          if (cdist > 0 && cdist < minDist) {
            const overlap = (minDist - cdist) / 2;
            const nx = cdx / cdist;
            const ny = cdy / cdist;

            p.x -= nx * overlap;
            p.y -= ny * overlap;
            p2.x += nx * overlap;
            p2.y += ny * overlap;

            const kx = p.vx - p2.vx;
            const ky = p.vy - p2.vy;
            const pImpact = 2 * (nx * kx + ny * ky) / 2;

            p.vx -= pImpact * nx * 0.85;
            p.vy -= pImpact * ny * 0.85;
            p2.vx += pImpact * nx * 0.85;
            p2.vy += pImpact * ny * 0.85;
          }
        }
      }
      const selectedParticles = particles.filter((p) => selectedSeatIds.includes(p.seatId));
      if (selectedParticles.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(248, 68, 100, 0.4)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        for (let s = 0; s < selectedParticles.length - 1; s++) {
          ctx.moveTo(selectedParticles[s].x, selectedParticles[s].y);
          ctx.lineTo(selectedParticles[s + 1].x, selectedParticles[s + 1].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
      const now = performance.now() * 0.003;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const isSelected = selectedSeatIds.includes(p.seatId);
        const isBooked = p.status === "BOOKED" || (p.status === "LOCKED" && !p.isLockedByMe);

        ctx.save();
        ctx.beginPath();

        let currentRadius = p.radius;
        if (isSelected) {
          currentRadius = p.baseRadius + 3 + Math.sin(now + p.pulseOffset) * 1.5;
        }

        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);

        if (isBooked) {
          ctx.fillStyle = "#334155";
          ctx.fill();
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (isSelected) {
          ctx.fillStyle = "#F84464";
          ctx.shadowColor = "#F84464";
          ctx.shadowBlur = 16;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          ctx.fillStyle = p.hovered ? "#FFFFFF" : p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.hovered ? 12 : 4;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.fillStyle = isSelected || isBooked ? "#FFFFFF" : "#0F172A";
        ctx.font = `bold ${Math.max(9, currentRadius * 0.55)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.seatCode || `${p.rowName}${p.seatNumber}`, p.x, p.y);

        ctx.restore();
      }

      animationFrameId.current = requestAnimationFrame(renderPhysicsFrame);
    };

    animationFrameId.current = requestAnimationFrame(renderPhysicsFrame);
    return () => {
      isMounted = false;
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [viewMode, selectedSeatIds]);
  const handleCanvasMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mousePos.current = { x, y, active: true };

    const particles = seatsPhysicsState.current;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dist = Math.sqrt((x - p.x) ** 2 + (y - p.y) ** 2);
      p.hovered = dist <= p.radius + 4;
    }
  };

  const handleCanvasMouseLeave = () => {
    mousePos.current = { x: -1000, y: -1000, active: false };
    seatsPhysicsState.current.forEach((p) => (p.hovered = false));
  };

  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const particles = seatsPhysicsState.current;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dist = Math.sqrt((x - p.x) ** 2 + (y - p.y) ** 2);
      if (dist <= p.radius + 6) {
        const unavailable = p.status === "BOOKED" || (p.status === "LOCKED" && !p.isLockedByMe);
        if (!unavailable) {
          onToggleSeat({
            seatId: p.seatId,
            seatCode: p.seatCode || `${p.rowName}${p.seatNumber}`,
            rowName: p.rowName,
            seatNumber: p.seatNumber,
            tierCategory: p.tierCategory,
            price: p.price,
            status: p.status,
            isLockedByMe: p.isLockedByMe
          });
        }
        break;
      }
    }
  };

  return (
    <div className="seat-layout-container">
      <div className="seat-view-header">
        <div className="cinema-header-meta">
          <h2>{seatMapData.cinemaName}</h2>
          <p>
            {seatMapData.screenName} • {seatMapData.movieTitle}
          </p>
        </div>
        <button
          type="button"
          className={`view-toggle-btn ${viewMode === "interactive" ? "active" : ""}`}
          onClick={() => setViewMode(viewMode === "standard" ? "interactive" : "standard")}
          title="Toggle between standard cinema grid and interactive 3D layout"
        >
          <span className="toggle-icon">{viewMode === "interactive" ? "✨" : "📐"}</span>
          <span>
            Layout View: <strong>{viewMode === "interactive" ? "Interactive 3D" : "Standard Grid"}</strong>
          </span>
          <span className="mode-pill">{viewMode === "interactive" ? "Physics" : "Rows"}</span>
        </button>
      </div>
      <div className="seat-legend-bar">
        <div className="legend-item">
          <span className="legend-box seat-available"></span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-box seat-selected"></span>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <span className="legend-box seat-booked"></span>
          <span>Unavailable</span>
        </div>
        {tiers.map((tier) => (
          <div key={tier.tierName} className="legend-item">
            <span className={`legend-box seat-${tier.tierName.toLowerCase()}`}></span>
            <span>{tier.tierLabel || tier.tierName}</span>
          </div>
        ))}
      </div>
      {viewMode === "standard" && (
        <div className="tiered-grid-container">
          {tiers.map((tier) => {
            const rowMap = {};
            (tier.seats || []).forEach((seat) => {
              if (!rowMap[seat.rowName]) rowMap[seat.rowName] = [];
              rowMap[seat.rowName].push(seat);
            });

            return (
              <div key={tier.tierName} className="seat-tier-section">
                <div className="tier-header-bar">
                  <span className="tier-title">{tier.tierLabel || tier.tierName}</span>
                  <div className="tier-line"></div>
                </div>

                <div className="tier-rows">
                  {Object.entries(rowMap).map(([rowLabel, seatsInRow]) => (
                    <div key={rowLabel} className="seat-row">
                      <span className="row-label">{rowLabel}</span>
                      <div className="row-seats">
                        {seatsInRow.map((seat) => {
                          const isSelected = selectedSeatIds.includes(seat.seatId);
                          const isBooked =
                            seat.status === "BOOKED" || (seat.status === "LOCKED" && !seat.isLockedByMe);

                          let tierClass = "tier-classic";
                          if (seat.tierCategory === "RECLINER") tierClass = "tier-recliner";
                          else if (seat.tierCategory === "PRIME") tierClass = "tier-prime";

                          return (
                            <button
                              key={seat.seatId}
                              disabled={isBooked}
                              className={`seat-btn ${tierClass} ${isSelected ? "selected" : ""} ${
                                isBooked ? "booked" : ""
                              }`}
                              onClick={() => onToggleSeat(seat)}
                              title={`${seat.seatCode || rowLabel + seat.seatNumber} • ₹${seat.price}`}
                            >
                              {seat.seatNumber}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="cinema-stage-container">
            <div className="stage-screen-curve"></div>
            <p className="stage-caption">Cinema Screen • All eyes this way</p>
          </div>
        </div>
      )}
      {viewMode === "interactive" && (
        <div className="canvas-viewport-container">
          <div className="canvas-instruction-badge">
            Move cursor to interact • Click any floating seat bubble to select/deselect
          </div>
          <canvas
            ref={canvasRef}
            className="seat-map-canvas"
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={handleCanvasMouseLeave}
            onClick={handleCanvasClick}
          />
        </div>
      )}
    </div>
  );
}

export default InteractiveSeatSelector;
