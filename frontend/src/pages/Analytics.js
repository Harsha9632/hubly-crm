import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/Analytics.css';

const Analytics = () => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/analytics`);
      const data = await response.json();
      setAnalytics(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Set default data if API fails
      setAnalytics({
        totalChats: 122,
        resolvedPercentage: 80,
        averageReplyTime: 0,
        missedChatsWeekly: [
          { week: 'Week 1', value: 13 },
          { week: 'Week 2', value: 8 },
          { week: 'Week 3', value: 14 },
          { week: 'Week 4', value: 9 },
          { week: 'Week 5', value: 5 },
          { week: 'Week 6', value: 13 },
          { week: 'Week 7', value: 4 },
          { week: 'Week 8', value: 9 },
          { week: 'Week 9', value: 18 },
          { week: 'Week 10', value: 20 },
        ]
      });
      setLoading(false);
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Show minimal loading spinner while data loads
  if (loading || !analytics) {
    return (
      <div className="analytics-page">
        <Sidebar />
        <div className="analytics-content">
          <div className="analytics-header">
            <h1>Analytics</h1>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px' 
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #41e518',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const maxValue = 25;
  const chartHeight = 160;
  const chartWidth = 400;
  const paddingLeft = 19;
  const paddingBottom = 30;
  const paddingTop = 12;

  const points = analytics.missedChatsWeekly.map((item, index) => {
    const x = paddingLeft + (index * (chartWidth - paddingLeft) / (analytics.missedChatsWeekly.length - 1));
    const y = chartHeight - paddingBottom - ((item.value / maxValue) * (chartHeight - paddingBottom - paddingTop));
    return { x, y, value: item.value };
  });

  const pathData = points.map((point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    const prevPoint = points[index - 1];
    const cpX = (prevPoint.x + point.x) / 2;
    return `Q ${cpX} ${prevPoint.y}, ${cpX} ${(prevPoint.y + point.y) / 2} Q ${cpX} ${point.y}, ${point.x} ${point.y}`;
  }).join(' ');

  const circumference = 2 * Math.PI * 40;
  const strokeDasharray = `${(analytics.resolvedPercentage / 100) * circumference} ${circumference}`;

  return (
    <div className="analytics-page">
      <Sidebar />
      
      <div className="analytics-content">
        <div className="analytics-header">
          <h1>Analytics</h1>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h2 className="card-title-green">Missed Chats</h2>
            <button className="menu-dots">⋯</button>
          </div>
          <div className="chart-container-compact">
            <svg 
              width="100%" 
              height="100%" 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              preserveAspectRatio="xMidYMid meet"
            >
              {[0, 5, 10, 15, 20, 25].map((tick) => (
                <g key={tick}>
                  <text
                    x={paddingLeft - 7}
                    y={chartHeight - paddingBottom - ((tick / maxValue) * (chartHeight - paddingBottom - paddingTop))}
                    textAnchor="end"
                    alignmentBaseline="middle"
                    fontSize="10"
                    fill="#9CA3AF"
                  >
                    {tick}
                  </text>
                  <line
                    x1={paddingLeft}
                    y1={chartHeight - paddingBottom - ((tick / maxValue) * (chartHeight - paddingBottom - paddingTop))}
                    x2={chartWidth}
                    y2={chartHeight - paddingBottom - ((tick / maxValue) * (chartHeight - paddingBottom - paddingTop))}
                    stroke="#E5E7EB"
                    strokeWidth="1"
                  />
                </g>
              ))}

              {analytics.missedChatsWeekly.map((item, index) => {
                const x = paddingLeft + (index * (chartWidth - paddingLeft) / (analytics.missedChatsWeekly.length - 1));
                return (
                  <text
                    key={index}
                    x={x}
                    y={chartHeight - 7}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#9CA3AF"
                  >
                    {item.week}
                  </text>
                );
              })}

              <path
                d={pathData}
                fill="none"
                stroke="#41e518ff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {points.map((point, index) => (
                <g key={index}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4.5"
                    fill="#41e518ff"
                    stroke="#fff"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredPoint(index)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    style={{ cursor: 'pointer' }}
                  />
                  {hoveredPoint === index && (
                    <g>
                      <rect
                        x={point.x - 28}
                        y={point.y - 38}
                        width="56"
                        height="28"
                        rx="4"
                        fill="#000"
                      />
                      <text
                        x={point.x}
                        y={point.y - 26}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#fff"
                        fontWeight="600"
                      >
                        Chats
                      </text>
                      <text
                        x={point.x}
                        y={point.y - 16}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#fff"
                        fontWeight="600"
                      >
                        {point.value}
                      </text>
                      <polygon
                        points={`${point.x},${point.y - 10} ${point.x - 4},${point.y - 13} ${point.x + 4},${point.y - 13}`}
                        fill="#000"
                      />
                    </g>
                  )}
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="analytics-grid-2col">
          <div className="analytics-card-compact">
            <h2 className="card-title-green">Average Reply time</h2>
            <div className="metric-row">
              <div className="metric-description">
                <p>
                  For highest customer satisfaction rates you should aim to reply to an incoming customer's 
                  message in 15 seconds or less. Quick responses will get you more conversations.
                </p>
              </div>
              <div className="metric-value">
                <span className="value-large green">{analytics.averageReplyTime} secs</span>
              </div>
            </div>
          </div>

          <div className="analytics-card-compact">
            <h2 className="card-title-green">Resolved Tickets</h2>
            <div className="metric-row">
              <div className="metric-description">
                <p>
                  A callback system on a website, as well as proactive invitations, help to attract even 
                  more customers. A separate round button for ordering a call with a small animation.
                </p>
              </div>
              <div className="metric-value">
                <div className="circular-progress-compact">
                  <svg viewBox="0 0 100 100" width="80" height="80">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#75e828ff"
                      strokeWidth="10"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="percentage-text green">{analytics.resolvedPercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-card-compact">
          <h2 className="card-title-black">Total Chats</h2>
          <div className="metric-row">
            <div className="metric-description">
              <p>
                This metric shows the total number of chats for all Channels for the selected period
              </p>
            </div>
            <div className="metric-value">
              <span className="value-large green">{analytics.totalChats} Chats</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;