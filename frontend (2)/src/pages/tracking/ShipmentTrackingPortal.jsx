import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { HoldAlertBanner } from '../../components/common/HoldAlertBanner';
import {
  Search,
  Compass,
  Ship,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  Anchor,
  FileText,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { trackingService } from '../../services';

export const ShipmentTrackingPortal = ({ initialQuery = '', onNavigate }) => {
  const { shipments, warehouseReceipts, billsOfLading } = useAppData();
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [searchResult, setSearchResult] = useState(null);
  const [searched, setSearched] = useState(Boolean(initialQuery));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      setIsLoading(true);
      trackingService.track(initialQuery).then(res => {
        if (res && res.data) {
          setSearchResult(res.data);
        } else {
          setSearchResult(null);
        }
        setSearched(true);
        setIsLoading(false);
      });
    }
  }, [initialQuery]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const res = await trackingService.track(searchQuery);
      if (res && res.data) {
        setSearchResult(res.data);
      } else {
        const matched = (shipments || []).find(s =>
          s.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          s.shipmentNumber?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          s.containerNumber?.toLowerCase().includes(searchQuery.toLowerCase().trim())
        );
        setSearchResult(matched || null);
      }
    } catch (err) {
      console.warn('Tracking query error:', err.message);
      setSearchResult(null);
    } finally {
      setSearched(true);
      setIsLoading(false);
    }
  };

  const sampleTrackings = (shipments || []).slice(0, 4).map(s => ({
    label: `${s.destinationCode || s.destinationPort || 'Cargo'} (${s.status || 'Active'})`,
    code: s.trackingNumber
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <PageHeader
        title="Cargo Tracking &amp; Milestone Timeline"
        subtitle="Real-time status tracking for shipments, bills of lading, warehouse receipts, and containers."
        icon={Compass}
        breadcrumbs={[
          { label: 'Tracking', href: '#' },
          { label: 'Shipment Tracking' }
        ]}
      />

      {/* Big Search Box */}
      <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #0A192F 0%, #102A4E 100%)', color: '#FFFFFF' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.35rem', marginBottom: '0.5rem' }}>
            Track Your Freight Consignment
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
            Enter a Tracking Number (TRK-...), Master B/L Number (BL-...), Warehouse Receipt (WR-...), or Container Number.
          </p>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
            <div className="input-with-icon" style={{ flex: 1 }}>
              <Search size={18} className="input-icon-left" style={{ color: '#64748B' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Enter tracking code (e.g. TRK-VI-994821)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: '44px', fontSize: '0.95rem' }}
              />
            </div>
            <button type="submit" className="btn btn-gold" style={{ padding: '0 1.5rem', height: '44px' }}>
              <span>Track Cargo</span>
            </button>
          </form>

          {/* Quick Clickable Examples if available */}
          {sampleTrackings.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Try Example:</span>
              {sampleTrackings.map(ex => (
                <button
                  key={ex.code}
                  type="button"
                  onClick={() => {
                    setSearchQuery(ex.code);
                    const matched = shipments.find(s => s.trackingNumber === ex.code);
                    setSearchResult(matched || null);
                    setSearched(true);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#FFFFFF',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tracking Result View */}
      {searchResult ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Hold notice if applicable */}
          {searchResult.blStatus === 'On Hold' && (
            <HoldAlertBanner
              blNumber={searchResult.billOfLadingNumber}
              holdDetails={{
                reason: "Payment Pending: Freight & Documentation Charges Unsettled",
                placedBy: "Finance & Accounts Dept",
                placedAt: "2026-08-28 02:45 PM"
              }}
              onClearHoldClick={() => onNavigate('bills-of-lading', searchResult.billOfLadingId)}
            />
          )}

          {/* Shipment Summary Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>TRACKING IDENTIFIER</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0A192F', fontFamily: 'JetBrains Mono, monospace' }}>
                  {searchResult.trackingNumber}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <StatusBadge status={searchResult.status} size="lg" />
                <button
                  onClick={() => onNavigate('shipments', searchResult.id)}
                  className="btn btn-outline btn-sm"
                >
                  <span>Full Shipment Details</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748B', fontSize: '0.75rem' }}>Origin Port</span>
                <div style={{ fontWeight: 700, color: '#0A192F' }}>{searchResult.origin}</div>
              </div>
              <div>
                <span style={{ color: '#64748B', fontSize: '0.75rem' }}>Destination Port</span>
                <div style={{ fontWeight: 800, color: '#0284C7' }}>{searchResult.destinationPort}</div>
              </div>
              <div>
                <span style={{ color: '#64748B', fontSize: '0.75rem' }}>Vessel &amp; Voyage</span>
                <div style={{ fontWeight: 700 }}>{searchResult.vesselName} ({searchResult.voyageNumber})</div>
              </div>
              <div>
                <span style={{ color: '#64748B', fontSize: '0.75rem' }}>Estimated Arrival</span>
                <div style={{ fontWeight: 700, color: '#059669' }}>{searchResult.eta}</div>
              </div>
            </div>

            {/* Current Position Marker */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.85rem 1.15rem', borderRadius: '8px', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MapPin size={20} style={{ color: '#0284C7', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>CURRENT SHIPMENT STATUS / LOCATION</div>
                <div style={{ fontWeight: 700, color: '#0A192F', fontSize: '0.9rem' }}>{searchResult.currentLocation}</div>
              </div>
            </div>

            {/* Step-by-Step Vertical Timeline */}
            <h3 style={{ fontSize: '1rem', color: '#0A192F', marginBottom: '1.25rem' }}>
              Shipment Progress Checkpoints
            </h3>

            <div className="tracking-timeline">
              {(searchResult.trackingCheckpoints || []).map((chk, idx) => (
                <div
                  key={chk.id || idx}
                  className={`timeline-item ${chk.status === 'Completed' ? 'completed' : chk.status === 'Active' ? 'active' : ''}`}
                >
                  <div className="timeline-marker">
                    {chk.status === 'Completed' && <CheckCircle2 size={12} />}
                    {chk.status === 'Active' && <Anchor size={12} />}
                    {chk.status === 'Pending' && <Clock size={10} />}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span className="timeline-title">{chk.stage}</span>
                    <span className="timeline-time">{chk.date} {chk.time ? `• ${chk.time}` : ''}</span>
                  </div>

                  {chk.location && (
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0284C7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {chk.location}
                    </div>
                  )}

                  <div className="timeline-desc">{chk.notes}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : searched ? (
        <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748B' }}>
          <Compass size={40} style={{ color: '#CBD5E1', margin: '0 auto 0.5rem' }} />
          <div style={{ fontWeight: 700, color: '#0A192F', fontSize: '1.05rem' }}>No Consignment Found</div>
          <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            We could not locate any active shipment or cargo matching "{searchQuery}".
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748B' }}>
          <Compass size={40} style={{ color: '#CBD5E1', margin: '0 auto 0.5rem' }} />
          <div style={{ fontWeight: 700, color: '#0A192F', fontSize: '1.05rem' }}>Track Cargo Consignment</div>
          <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            Enter a Tracking Number, Master B/L Number, or Warehouse Receipt above to track real-time milestones.
          </div>
        </div>
      )}
    </div>
  );
};
