import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from '../components/Toast';
import { useUser } from '../context/UserContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function EditApartment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    pricePerNight: '',
    description: '',
    beds: '',
    bathrooms: '',
    maxGuests: '',
    amenities: [],
    available: true,
    images: []
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apartment, setApartment] = useState(null);

  // Λίστα διαθέσιμων παροχών
  const availableAmenities = [
    'WiFi', 'Κλιματισμός', 'Θέρμανση', 'Κουζίνα', 'Πλυντήριο', 
    'Τηλεόραση', 'Μπαλκόνι', 'Πάρκινγκ', 'Ασανσέρ', 'Κήπος'
  ];

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        const response = await axios.get(`/apartments/${id}`);
        const apt = response.data;
        
        // Έλεγχος αν ο χρήστης είναι ιδιοκτήτης ή admin
        if (user.role !== 'ADMIN' && apt.owner._id !== user._id) {
          toast.error('Δεν έχετε δικαίωμα επεξεργασίας αυτού του διαμερίσματος');
          navigate('/');
          return;
        }
        
        setApartment(apt);
        setFormData({
          title: apt.title || '',
          location: apt.location || '',
          pricePerNight: apt.pricePerNight || '',
          description: apt.description || '',
          beds: apt.beds || '',
          bathrooms: apt.bathrooms || '',
          maxGuests: apt.maxGuests || '',
          amenities: apt.amenities || [],
          available: apt.available !== false,
          images: apt.images || []
        });
      } catch (error) {
        console.error('Error fetching apartment:', error);
        toast.error('Σφάλμα κατά τη φόρτωση του διαμερίσματος');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      fetchApartment();
    }
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.warning(`Η φωτογραφία ${file.name} είναι πολύ μεγάλη. Μέγιστο μέγεθος: 5MB`);
          continue;
        }
        
        try {
          const compressedImage = await compressImage(file);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, compressedImage]
          }));
        } catch (error) {
          console.error('Error compressing image:', error);
          toast.error(`Σφάλμα κατά τη συμπίεση της φωτογραφίας ${file.name}`);
        }
      }
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.location || !formData.pricePerNight) {
      toast.warning('Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία');
      return;
    }

    if (formData.pricePerNight <= 0) {
      toast.error('Η τιμή πρέπει να είναι μεγαλύτερη από 0');
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        ...formData,
        pricePerNight: parseFloat(formData.pricePerNight),
        beds: formData.beds ? parseInt(formData.beds) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        maxGuests: formData.maxGuests ? parseInt(formData.maxGuests) : undefined
      };

      await axios.put(`/apartments/${id}`, updateData);
      toast.success('Το διαμέρισμα ενημερώθηκε επιτυχώς!');
      navigate(`/apartment/${id}`);
    } catch (err) {
      console.error('Error updating apartment:', err);
      toast.error(err.response?.data?.error || 'Σφάλμα κατά την ενημέρωση του διαμερίσματος');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!apartment) {
    return (
      <div className="text-center">
        <h2>Διαμέρισμα δεν βρέθηκε</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Επιστροφή στην αρχική
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="text-center mb-4">
        <h1 style={{ 
          background: 'var(--secondary-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          ✏️ Επεξεργασία Διαμερίσματος
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Ενημερώστε τα στοιχεία του διαμερίσματός σας
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">🏷️ Τίτλος *</label>
                  <input
                    type="text"
                    name="title"
                    className="form-input"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="π.χ. Όμορφο διαμέρισμα στο κέντρο"
                    required
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">📍 Τοποθεσία *</label>
                  <input
                    type="text"
                    name="location"
                    className="form-input"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="π.χ. Αθήνα, Θεσσαλονίκη"
                    required
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">💰 Τιμή ανά βραδιά (€) *</label>
                  <input
                    type="number"
                    name="pricePerNight"
                    className="form-input"
                    value={formData.pricePerNight}
                    onChange={handleChange}
                    placeholder="π.χ. 50"
                    min="1"
                    step="0.01"
                    required
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">✅ Διαθεσιμότητα</label>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="available"
                      className="form-check-input"
                      checked={formData.available}
                      onChange={handleChange}
                      disabled={saving}
                    />
                    <label className="form-check-label">
                      Διαθέσιμο για κρατήσεις
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">📝 Περιγραφή</label>
              <textarea
                name="description"
                className="form-input"
                value={formData.description}
                onChange={handleChange}
                placeholder="Περιγράψτε το διαμέρισμά σας..."
                rows="4"
                disabled={saving}
                style={{ resize: 'vertical', minHeight: '100px' }}
              />
            </div>

            <div className="row">
              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-label">🛏️ Κρεβάτια</label>
                  <input
                    type="number"
                    name="beds"
                    className="form-input"
                    value={formData.beds}
                    onChange={handleChange}
                    placeholder="π.χ. 2"
                    min="1"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-label">🚿 Μπάνια</label>
                  <input
                    type="number"
                    name="bathrooms"
                    className="form-input"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    placeholder="π.χ. 1"
                    min="1"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-label">👥 Μέγιστοι επισκέπτες</label>
                  <input
                    type="number"
                    name="maxGuests"
                    className="form-input"
                    value={formData.maxGuests}
                    onChange={handleChange}
                    placeholder="π.χ. 4"
                    min="1"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">📸 Φωτογραφίες</label>
              <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                Μέγιστο μέγεθος: 5MB ανά φωτογραφία. Οι φωτογραφίες θα συμπιεστούν αυτόματα.
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="form-input"
                disabled={saving}
                style={{ marginBottom: '1rem' }}
              />
              
              {formData.images.length > 0 && (
                <div className="row" style={{ marginTop: '1rem' }}>
                  {formData.images.map((image, index) => (
                    <div key={index} className="col-md-3 col-sm-4 col-6" style={{ marginBottom: '1rem' }}>
                      <div style={{ position: 'relative' }}>
                        <img
                          src={image}
                          alt={`Φωτογραφία ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid var(--border-color)'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={saving}
                          style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            background: 'rgba(255, 0, 0, 0.8)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '25px',
                            height: '25px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">🎯 Παροχές</label>
              <div className="row">
                {availableAmenities.map((amenity) => (
                  <div key={amenity} className="col-md-4 col-sm-6">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                        disabled={saving}
                      />
                      <label className="form-check-label">
                        {amenity}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'flex-end',
              marginTop: '2rem'
            }}>
              <button
                type="button"
                onClick={() => navigate(`/apartment/${id}`)}
                className="btn btn-outline"
                disabled={saving}
              >
                ❌ Ακύρωση
              </button>
              
              <button
                type="submit"
                className="btn btn-secondary"
                disabled={saving}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem'
                }}
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    Αποθήκευση...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Αποθήκευση Αλλαγών
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
