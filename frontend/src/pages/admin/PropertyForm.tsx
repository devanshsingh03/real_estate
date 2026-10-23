import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Trash2, ArrowUp, ArrowDown, ImagePlus } from 'lucide-react';
import { api, resolveMediaUrl } from '../../lib/api';
import type { AdminProperty, AdminPropertyImage, Amenity, Location } from '../../types';

interface FormState {
  title: string;
  description: string;
  propertyType: string;
  status: string;
  price: string;
  areaSqft: string;
  dimensions: string;
  frontage: string;
  locationId: string;
  address: string;
  latitude: string;
  longitude: string;
  projectName: string;
  verified: boolean;
  plotNumber: string;
  layoutX: string;
  layoutY: string;
  layoutW: string;
  layoutD: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  featured: boolean;
  amenityIds: number[];
}

const emptyForm: FormState = {
  title: '', description: '', propertyType: 'residential', status: 'available',
  price: '', areaSqft: '', dimensions: '', frontage: '', locationId: '', address: '',
  latitude: '', longitude: '', projectName: '', verified: false, plotNumber: '',
  layoutX: '', layoutY: '', layoutW: '8', layoutD: '10', seoTitle: '', seoDescription: '',
  published: true, featured: false, amenityIds: [],
};

export default function PropertyForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [images, setImages] = useState<AdminPropertyImage[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/locations').then((res) => setLocations(res.data.data));
    api.get('/admin/amenities').then((res) => setAmenities(res.data.data));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/admin/properties/${id}`).then((res) => {
      const p: AdminProperty = res.data.data;
      setForm({
        title: p.title,
        description: p.description || '',
        propertyType: p.property_type,
        status: p.status,
        price: String(p.price),
        areaSqft: String(p.area_sqft),
        dimensions: p.dimensions || '',
        frontage: p.frontage || '',
        locationId: p.location_id ? String(p.location_id) : '',
        address: p.address || '',
        latitude: p.latitude != null ? String(p.latitude) : '',
        longitude: p.longitude != null ? String(p.longitude) : '',
        projectName: p.project_name || '',
        verified: !!p.verified,
        plotNumber: p.plot_number || '',
        layoutX: p.layout_x != null ? String(p.layout_x) : '',
        layoutY: p.layout_y != null ? String(p.layout_y) : '',
        layoutW: p.layout_w != null ? String(p.layout_w) : '8',
        layoutD: p.layout_d != null ? String(p.layout_d) : '10',
        seoTitle: p.seo_title || '',
        seoDescription: p.seo_description || '',
        published: !!p.published,
        featured: !!p.featured,
        amenityIds: p.amenities.map((a) => a.id),
      });
      setImages(p.images);
    }).finally(() => setLoading(false));
  }, [id, isEdit]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleAmenity(aid: number) {
    setForm((f) => ({
      ...f,
      amenityIds: f.amenityIds.includes(aid) ? f.amenityIds.filter((x) => x !== aid) : [...f.amenityIds, aid],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      title: form.title,
      description: form.description,
      propertyType: form.propertyType,
      status: form.status,
      price: Number(form.price),
      areaSqft: Number(form.areaSqft),
      dimensions: form.dimensions,
      frontage: form.frontage,
      locationId: form.locationId ? Number(form.locationId) : null,
      address: form.address,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      projectName: form.projectName,
      verified: form.verified,
      plotNumber: form.plotNumber,
      layoutX: form.layoutX ? Number(form.layoutX) : null,
      layoutY: form.layoutY ? Number(form.layoutY) : null,
      layoutW: form.layoutW ? Number(form.layoutW) : null,
      layoutD: form.layoutD ? Number(form.layoutD) : null,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
      published: form.published,
      featured: form.featured,
      amenityIds: form.amenityIds,
    };
    try {
      if (isEdit) {
        await api.put(`/admin/properties/${id}`, payload);
        navigate('/admin/properties');
      } else {
        const res = await api.post('/admin/properties', payload);
        navigate(`/admin/properties/${res.data.data.id}`, { replace: true });
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save plot.');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!id || !e.target.files?.length) return;
    setUploading(true);
    const formData = new FormData();
    Array.from(e.target.files).forEach((file) => formData.append('images', file));
    try {
      const res = await api.post(`/admin/properties/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages(res.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to upload images.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDeleteImage(imageId: number) {
    if (!id) return;
    await api.delete(`/admin/properties/${id}/images/${imageId}`);
    setImages((imgs) => imgs.filter((i) => i.id !== imageId));
  }

  async function moveImage(index: number, direction: -1 | 1) {
    if (!id) return;
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next);
    await api.put(`/admin/properties/${id}/images/reorder`, { order: next.map((i) => i.id) });
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-forest" /></div>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/admin/properties" className="mb-4 flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-forest">
        <ArrowLeft size={15} /> Back to properties
      </Link>
      <h1 className="font-display text-3xl font-semibold text-forest">{isEdit ? 'Edit Plot' : 'Add New Plot'}</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        <section className="rounded-2xl border border-forest/10 bg-white p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-forest">Basic Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Title</label>
              <input required value={form.title} onChange={(e) => update('title', e.target.value)} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Property Type</label>
              <select value={form.propertyType} onChange={(e) => update('propertyType', e.target.value)} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none">
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="agricultural">Agricultural</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Status</label>
              <select value={form.status} onChange={(e) => update('status', e.target.value)} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none">
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Price (₹)</label>
              <input required type="number" min="0" value={form.price} onChange={(e) => update('price', e.target.value)} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Area (sq.ft.)</label>
              <input required type="number" min="0" value={form.areaSqft} onChange={(e) => update('areaSqft', e.target.value)} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Dimensions</label>
              <input value={form.dimensions} onChange={(e) => update('dimensions', e.target.value)} placeholder="e.g. 35 ft x 34 ft" className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Frontage</label>
              <input value={form.frontage} onChange={(e) => update('frontage', e.target.value)} placeholder="e.g. 30 ft" className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Plot Number</label>
              <input value={form.plotNumber} onChange={(e) => update('plotNumber', e.target.value)} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Project Name</label>
              <input value={form.projectName} onChange={(e) => update('projectName', e.target.value)} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-forest/10 bg-white p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-forest">Location</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Location</label>
              <select value={form.locationId} onChange={(e) => update('locationId', e.target.value)} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none">
                <option value="">Select a location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.locality}, {l.city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Address</label>
              <input value={form.address} onChange={(e) => update('address', e.target.value)} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Latitude</label>
              <input type="number" step="any" value={form.latitude} onChange={(e) => update('latitude', e.target.value)} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Longitude</label>
              <input type="number" step="any" value={form.longitude} onChange={(e) => update('longitude', e.target.value)} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
          </div>
          {form.latitude && form.longitude && (
            <a
              href={`https://www.google.com/maps?q=${form.latitude},${form.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs font-medium text-forest underline"
            >
              Preview this location on Google Maps
            </a>
          )}
        </section>

        <section className="rounded-2xl border border-forest/10 bg-white p-6">
          <h2 className="mb-1 font-display text-lg font-semibold text-forest">3D Explorer Layout Position</h2>
          <p className="mb-4 text-xs text-charcoal/50">Used only by the Interactive 3D Plot Explorer. Plots sharing a Project Name appear together in one layout.</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Grid X</label>
              <input type="number" value={form.layoutX} onChange={(e) => update('layoutX', e.target.value)} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Grid Y</label>
              <input type="number" value={form.layoutY} onChange={(e) => update('layoutY', e.target.value)} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Width</label>
              <input type="number" value={form.layoutW} onChange={(e) => update('layoutW', e.target.value)} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Depth</label>
              <input type="number" value={form.layoutD} onChange={(e) => update('layoutD', e.target.value)} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-forest/10 bg-white p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-forest">Amenities</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {amenities.map((a) => (
              <label key={a.id} className="flex items-center gap-2 rounded-lg border border-forest/10 px-3 py-2 text-sm">
                <input type="checkbox" checked={form.amenityIds.includes(a.id)} onChange={() => toggleAmenity(a.id)} />
                {a.name}
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-forest/10 bg-white p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-forest">Images</h2>
          {!isEdit ? (
            <p className="text-sm text-charcoal/50">Save the plot first, then you can upload images.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {images.map((img, i) => (
                  <div key={img.id} className="group relative overflow-hidden rounded-xl border border-forest/10">
                    <img src={resolveMediaUrl(img.url)} alt="" className="aspect-[4/3] w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center gap-1 bg-charcoal/0 opacity-0 transition-opacity group-hover:bg-charcoal/50 group-hover:opacity-100">
                      <button type="button" onClick={() => moveImage(i, -1)} className="rounded-full bg-ivory/90 p-1.5"><ArrowUp size={13} /></button>
                      <button type="button" onClick={() => moveImage(i, 1)} className="rounded-full bg-ivory/90 p-1.5"><ArrowDown size={13} /></button>
                      <button type="button" onClick={() => handleDeleteImage(img.id)} className="rounded-full bg-ivory/90 p-1.5 text-red-700"><Trash2 size={13} /></button>
                    </div>
                    {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-forest px-2 py-0.5 text-[10px] text-ivory">Cover</span>}
                  </div>
                ))}
                <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-forest/20 text-charcoal/50 hover:border-forest/40">
                  {uploading ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
                  <span className="text-xs">Add images</span>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
                </label>
              </div>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-forest/10 bg-white p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-forest">SEO</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">SEO Title</label>
              <input value={form.seoTitle} onChange={(e) => update('seoTitle', e.target.value)} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">SEO Description</label>
              <textarea rows={2} value={form.seoDescription} onChange={(e) => update('seoDescription', e.target.value)} className="w-full rounded-lg border border-forest/15 px-3.5 py-2.5 text-sm outline-none focus:border-forest" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-forest/10 bg-white p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-forest">Visibility</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={(e) => update('published', e.target.checked)} /> Published (visible to buyers)</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} /> Featured on homepage</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.verified} onChange={(e) => update('verified', e.target.checked)} /> Verified listing</label>
          </div>
        </section>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-ivory disabled:opacity-60">
            {saving && <Loader2 size={16} className="animate-spin" />} {isEdit ? 'Save Changes' : 'Create Plot'}
          </button>
          <Link to="/admin/properties" className="rounded-full border border-forest/20 px-6 py-3 text-sm font-medium text-charcoal/70">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
