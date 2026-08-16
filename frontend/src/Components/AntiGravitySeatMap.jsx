import { useState, useEffect, useRef, useCallback } from "react";

function AntiGravitySeatMap({ seatMapData, selectedSeatIds, onToggleSeat }) {
  const [isAntiGravityMode, setIsAntiGravityMode] = useState(false);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const physicsBodiesRef = useRef([]);
  const mousePosRef = useRef({ x: -1000, y: -1000, isDown: false });

  // Flatten all seats from tiers
  const allSeats = seatMapData?.tiers
    ? seatMapData.tiers.flatMap((tier) => tier.seats)
    : [];

  // Initialize or update physics bodies when seats change or mode toggles
  useEffect(() => {
    if (!isAntiGravityMode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;

    // Create physics particles for each seat
    const bodies = allSeats.map((seat, index) => {
      // Find tier color
      let tierColor = "#4ABD5D"; // Classic
      let radius = 24;
      if (seat.tierCategory === "RECLINER") {
        tierColor = "#E5A00D";
        radius = 28;
      } else if (seat.tierCategory === "PRIME") {
        tierColor = "#2563EB";
        radius = 26;
      }

      // Initial distributed placement in floating space
      const cols = 10;
      const col = index % cols;
      const row = Math.floor(index / cols);

      const spacingX = width / (cols + 1);
      const spacingY = height / (Math.ceil(allSeats.length / cols) + 2);

      const x = spacingX * (col + 1) + (Math.random() - 0.5) * 40;
      const y = spacingY * (row + 1) + (Math.random() - 0.5) * 40;

      return {
        seatId: seat.seatId,
        seatCode: seat.seatCode,
        tierCategory: seat.tierCategory,
        price: seat.price,
        status: seat.status,
        x,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius,
        mass: radius,
        color: tierColor,
        pulseAngle: Math.random() * Math.PI * 2
      };
    });

    physicsBodiesRef.current = bodies;
  }, [isAntiGravityMode, seatMapData]);

  // Main Canvas Physics Loop (Native requestAnimationFrame)
  useEffect(() => {
    if (!isAntiGravityMode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let lastTime = performance.now();

    const render = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw Space / Nebula Background
      ctx.fillStyle = "#0a0b12";
      ctx.fillRect(0, 0, width, height);

      // Subtle starfield & grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Cursor Gravity Vortex
      const mouse = mousePosRef.current;
      if (mouse.x > 0 && mouse.y > 0) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 5, mouse.x, mouse.y, 160);
        gradient.addColorStop(0, "rgba(248, 68, 100, 0.25)");
        gradient.addColorStop(1, "rgba(248, 68, 100, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 160, 0, Math.PI * 2);
        ctx.fill();
      }

      const bodies = physicsBodiesRef.current;

      // 3. Update Physics & Floating Convection
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];

        // Ambient micro zero-g turbulence
        b.pulseAngle += 0.03;
        b.vx += Math.sin(b.pulseAngle) * 0.05;
        b.vy += Math.cos(b.pulseAngle) * 0.05;

        // Damping / terminal speed limit
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        const maxSpeed = 2.5;
        if (speed > maxSpeed) {
          b.vx = (b.vx / speed) * maxSpeed;
          b.vy = (b.vy / speed) * maxSpeed;
        }

        // Mouse attraction / vortex force
        if (mouse.x > 0 && mouse.y > 0) {
          const dx = mouse.x - b.x;
          const dy = mouse.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 5 && dist < 220) {
            const force = (220 - dist) / 220 * 0.4;
            b.vx += (dx / dist) * force;
            b.vy += (dy / dist) * force;
          }
        }

        // Apply velocities
        b.x += b.vx;
        b.y += b.vy;

        // Boundary Elastic Bounce
        const bounce = 0.85;
        if (b.x - b.radius < 10) {
          b.x = 10 + b.radius;
          b.vx = -b.vx * bounce;
        } else if (b.x + b.radius > width - 10) {
          b.x = width - 10 - b.radius;
          b.vx = -b.vx * bounce;
        }

        if (b.y - b.radius < 10) {
          b.y = 10 + b.radius;
          b.vy = -b.vy * bounce;
        } else if (b.y + b.radius > height - 10) {
          b.y = height - 10 - b.radius;
          b.vy = -b.vy * bounce;
        }
      }

      // 4. Inter-Bubble Elastic Collisions
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const b1 = bodies[i];
          const b2 = bodies[j];

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = b1.radius + b2.radius + 4;

          if (dist < minDist && dist > 0) {
            // Overlap resolution
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;

            b1.x -= nx * overlap;
            b1.y -= ny * overlap;
            b2.x += nx * overlap;
            b2.y += ny * overlap;

            // Elastic momentum exchange
            const kx = b1.vx - b2.vx;
            const ky = b1.vy - b2.vy;
            const p = 2 * (nx * kx + ny * ky) / (b1.mass + b2.mass);

            b1.vx -= p * b2.mass * nx;
            b1.vy -= p * b2.mass * ny;
            b2.vx += p * b1.mass * nx;
            b2.vy += p * b1.mass * ny;
          }
        }
      }

      // 5. Draw Orbit Connections between adjacent seats
      ctx.lineWidth = 1;
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const b1 = bodies[i];
          const b2 = bodies[j];
          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 80) {
            const alpha = (1 - dist / 80) * 0.15;
            ctx.strokeStyle = `rgba(248, 68, 100, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(b1.x, b1.y);
            ctx.lineTo(b2.x, b2.y);
            ctx.stroke();
          }
        }
      }

      // 6. Draw Seat Bubbles
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        const isSelected = selectedSeatIds.includes(b.seatId);
        const isBooked = b.status === "BOOKED";
        const isLocked = b.status === "LOCKED" && !isSelected;

        ctx.save();
        ctx.translate(b.x, b.y);

        // Halo / Glow
        if (isSelected) {
          ctx.shadowColor = "#F84464";
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.arc(0, 0, b.radius + 5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(248, 68, 100, 0.35)";
          ctx.fill();
        }

        // Bubble Body
        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);

        if (isBooked) {
          ctx.fillStyle = "#2d3142";
          ctx.strokeStyle = "#4f5d75";
        } else if (isLocked) {
          ctx.fillStyle = "#593e10";
          ctx.strokeStyle = "#E5A00D";
        } else if (isSelected) {
          ctx.fillStyle = "#F84464";
          ctx.strokeStyle = "#ffffff";
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
          ctx.strokeStyle = b.color;
        }

        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.fill();
        ctx.stroke();

        // Bubble Highlight reflection (Gloss)
        if (!isBooked) {
          ctx.beginPath();
          ctx.arc(-b.radius * 0.3, -b.radius * 0.3, b.radius * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
          ctx.fill();
        }

        // Seat Code Text
        ctx.shadowBlur = 0;
        ctx.fillStyle = isBooked ? "#718096" : "#ffffff";
        ctx.font = "bold 11px Poppins, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(b.seatCode, 0, isBooked ? 0 : -3);

        if (!isBooked) {
          ctx.font = "9px Poppins, sans-serif";
          ctx.fillStyle = isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.7)";
          ctx.fillText(`₹${b.price}`, 0, 9);
        }

        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAntiGravityMode, selectedSeatIds]);

  // Handle Canvas Click to Select/Deselect Bubble
  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const bodies = physicsBodiesRef.current;
    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];
      const dx = clickX - b.x;
      const dy = clickY - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= b.radius + 6) {
        if (b.status === "BOOKED") return;
        const seatObj = allSeats.find((s) => s.seatId === b.seatId);
        if (seatObj) {
          onToggleSeat(seatObj);
        }
        break;
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isDown: mousePosRef.current.isDown
    };
  };

  const handleMouseLeave = () => {
    mousePosRef.current = { x: -1000, y: -1000, isDown: false };
  };

  return (
    <div className="bms-seat-layout-viewport">
      {/* Header Bar with Cinema Info & Anti-Gravity Switch */}
      <div className="seat-layout-header">
        <div className="cinema-header-meta">
          <h2>{seatMapData.cinemaName}</h2>
          <p>
            <span>{seatMapData.screenName}</span> • <span>{seatMapData.formatType}</span> •{" "}
            <span>
              {new Date(seatMapData.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
          </p>
        </div>

        {/* The Anti-Gravity Toggle Switch */}
        <div className="anti-gravity-toggle-wrapper">
          <button
            className={`anti-gravity-btn ${isAntiGravityMode ? "active" : ""}`}
            onClick={() => setIsAntiGravityMode(!isAntiGravityMode)}
            title="Toggle zero-gravity floating physical seat mode"
          >
            <span className="gravity-icon">{isAntiGravityMode ? "🌌" : "🪐"}</span>
            <span className="gravity-text">
              Anti-Gravity: <strong>{isAntiGravityMode ? "ON" : "OFF"}</strong>
            </span>
            <span className="gravity-pill">{isAntiGravityMode ? "Physics" : "Grid"}</span>
          </button>
        </div>
      </div>

      {/* Seat Tier Legend */}
      <div className="bms-seat-legend">
        <div className="legend-item">
          <span className="legend-box seat-available"></span> Available
        </div>
        <div className="legend-item">
          <span className="legend-box seat-selected"></span> Selected
        </div>
        <div className="legend-item">
          <span className="legend-box seat-booked"></span> Sold Out
        </div>
        <div className="legend-item">
          <span className="legend-box seat-recliner"></span> Recliner (₹450)
        </div>
        <div className="legend-item">
          <span className="legend-box seat-prime"></span> Prime (₹280)
        </div>
        <div className="legend-item">
          <span className="legend-box seat-classic"></span> Classic (₹180)
        </div>
      </div>

      {/* MODE 1: STANDARD CINEMA TIERED GRID VIEW */}
      {!isAntiGravityMode && (
        <div className="tiered-grid-container">
          {seatMapData.tiers?.map((tier) => {
            // Group seats in this tier by row letter
            const rowsMap = {};
            tier.seats.forEach((seat) => {
              if (!rowsMap[seat.rowName]) rowsMap[seat.rowName] = [];
              rowsMap[seat.rowName].push(seat);
            });

            return (
              <div key={tier.tierName} className="seat-tier-section">
                <div className="tier-header-bar">
                  <span className="tier-title">{tier.tierLabel}</span>
                  <span className="tier-line"></span>
                </div>

                <div className="tier-rows">
                  {Object.entries(rowsMap).map(([rowLetter, seatsInRow]) => (
                    <div key={rowLetter} className="seat-row">
                      <span className="row-label">{rowLetter}</span>

                      <div className="row-seats">
                        {seatsInRow.map((seat) => {
                          const isSelected = selectedSeatIds.includes(seat.seatId);
                          const isBooked = seat.status === "BOOKED";
                          const isLocked = seat.status === "LOCKED" && !isSelected;

                          let seatClass = "seat-btn";
                          if (isBooked) seatClass += " booked";
                          else if (isSelected) seatClass += " selected";
                          else if (isLocked) seatClass += " locked";
                          else seatClass += ` tier-${seat.tierCategory.toLowerCase()}`;

                          return (
                            <button
                              key={seat.seatId}
                              className={seatClass}
                              disabled={isBooked || isLocked}
                              onClick={() => onToggleSeat(seat)}
                              title={`${seat.seatCode} - ₹${seat.price} (${seat.tierCategory})`}
                            >
                              <span className="seat-num">{seat.seatNumber}</span>
                            </button>
                          );
                        })}
                      </div>

                      <span className="row-label">{rowLetter}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Curved Cinema Screen */}
          <div className="cinema-screen-container">
            <div className="screen-curve"></div>
            <p className="screen-caption">All eyes this way please</p>
          </div>
        </div>
      )}

      {/* MODE 2: ANTI-GRAVITY 2D PHYSICS CANVAS VIEW */}
      {isAntiGravityMode && (
        <div className="anti-gravity-canvas-wrapper">
          <div className="canvas-instruction-overlay">
            <span>✨ Zero-Gravity Physics Active: Tap/click floating seat bubbles to select them!</span>
          </div>
          <canvas
            ref={canvasRef}
            width={880}
            height={520}
            className="anti-gravity-canvas"
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        </div>
      )}
    </div>
  );
}

export default AntiGravitySeatMap;
