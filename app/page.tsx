'use client'

import { useEffect, useState } from 'react'
import { supabase, CoworkingGroup } from '@/lib/supabase'
import dynamic from 'next/dynamic'

// Dynamically import Map component (Leaflet doesn't work with SSR)
const Map = dynamic(() => import('@/components/map'), { ssr: false })

export default function Home() {
  const [groups, setGroups] = useState<CoworkingGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const [formData, setFormData] = useState({
    group_name: '',
    location: '',
    city: '',
    country: '',
    description: '',
    website_url: '',
    tags: '',
    group_status: 'open' as 'open' | 'full' | 'seeking_lead',
    added_by: ''
  })

  useEffect(() => {
    fetchGroups()
  }, [])

  async function fetchGroups() {
    try {
      const { data, error } = await supabase
        .from('coworking_groups')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGroups(data || [])
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredGroups = groups.filter(group => {
    if (filter === 'all') return true
    return group.group_status === filter
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const { error } = await supabase
        .from('coworking_groups')
        .insert([
          {
            group_name: formData.group_name,
            location: formData.location,
            city: formData.city,
            country: formData.country,
            description: formData.description,
            website_url: formData.website_url || null,
            tags: tagsArray.length > 0 ? tagsArray : null,
            group_status: formData.group_status,
            added_by: formData.added_by,
            is_approved: false,
            is_posthog_added: false
          }
        ])

      if (error) throw error

      setSubmitted(true)
      setFormData({
        group_name: '',
        location: '',
        city: '',
        country: '',
        description: '',
        website_url: '',
        tags: '',
        group_status: 'open',
        added_by: ''
      })
    } catch (error) {
      console.error('Error submitting group:', error)
      alert('Error submitting group. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-small font-medium bg-green-50 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Open
          </span>
        )
      case 'full':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-small font-medium bg-red-50 text-red-700">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Full
          </span>
        )
      case 'seeking_lead':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-small font-medium bg-orange-50 text-orange-700">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            Seeking lead
          </span>
        )
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="border-b border-border-color">
        <div className="max-w-[1400px] mx-auto px-8 py-12">
          <div className="flex items-center gap-3 mb-3">
           <img 
            src="https://res.cloudinary.com/dmukukwp6/image/upload/v1710055416/posthog.com/contents/images/media/social-media-headers/hogs/builder_hog.png"
            alt="Builder Hog"
            style={{ height: '64px', width: 'auto' }}
            className="object-contain"
            />
            <h1 className="mb-0">Cool co-working groups (for builders)</h1>
          </div>
          <p className="text-large opacity-90">
            Discover amazing co-working communities around the world. Want to add yours?{' '}
            <button 
              onClick={() => setShowForm(!showForm)}
              className="text-posthog-red hover:opacity-100 font-semibold"
            >
              {showForm ? 'Hide form' : 'Submit a group'}
            </button>{' '}
            Want to start one?{' '}
            <a 
              href="https://posthog.com/community-incubator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-posthog-red hover:opacity-100 font-semibold"
            >
              Learn more →
            </a>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border-color bg-bg-accent">
        <div className="max-w-[1400px] mx-auto px-8 py-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md font-semibold transition text-small ${
                filter === 'all'
                  ? 'bg-text-primary text-bg-primary'
                  : 'bg-white border border-border-color hover:border-text-primary'
              }`}
            >
              All ({groups.length})
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-3 py-1.5 rounded-md font-semibold transition text-small ${
                filter === 'open'
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-border-color hover:border-text-primary'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setFilter('full')}
              className={`px-3 py-1.5 rounded-md font-semibold transition text-small ${
                filter === 'full'
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-border-color hover:border-text-primary'
              }`}
            >
              Full
            </button>
            <button
              onClick={() => setFilter('seeking_lead')}
              className={`px-3 py-1.5 rounded-md font-semibold transition text-small ${
                filter === 'seeking_lead'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white border border-border-color hover:border-text-primary'
              }`}
            >
              Seeking Lead
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Table */}
        {loading ? (
          <div className="text-center py-20">
            <p className="opacity-70">Loading groups...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-20 border border-border-color rounded-lg bg-white">
            <p className="opacity-70">No groups found. Be the first to submit one!</p>
          </div>
        ) : (
          <div className="border border-border-color rounded-lg overflow-hidden bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-bg-accent">
                  <th className="pl-8 pr-6 py-4 text-left text-small font-semibold opacity-90 border-b border-r border-border-color">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-small font-semibold opacity-90 border-b border-r border-border-color">
                    Group Name
                  </th>
                  <th className="px-6 py-4 text-left text-small font-semibold opacity-90 border-b border-r border-border-color">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-small font-semibold opacity-90 border-b border-r border-border-color">
                    Description
                  </th>
                  <th className="pl-6 pr-8 py-4 text-left text-small font-semibold opacity-90 border-b border-border-color">
                    More info
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((group, index) => (
                  <tr 
                    key={group.id} 
                    className={`hover:bg-bg-accent transition ${
                      index !== filteredGroups.length - 1 ? 'border-b border-border-color' : ''
                    }`}
                  >
                    <td className="pl-8 pr-6 py-5 align-top border-r border-border-color">
                      {getStatusBadge(group.group_status)}
                    </td>
                    <td className="px-6 py-5 align-top border-r border-border-color">
                      <div className="font-semibold opacity-90">
                        {group.group_name}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-small opacity-80 align-top border-r border-border-color">
                      {group.location}
                    </td>
                    <td className="px-6 py-5 text-small opacity-90 leading-relaxed align-top border-r border-border-color">
                      {group.description}
                    </td>
                    <td className="pl-6 pr-8 py-5 align-top">
                      {group.website_url ? (
                        <a
                          href={group.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1"
                        >
                          Website →
                        </a>
                      ) : (
                        <span className="text-posthog-gray text-small">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Map - Above the form */}
        <div className="mt-12 border-t border-border-color pt-12">
          <h2 className="mb-4">Group Locations</h2>
          <p className="text-large opacity-90 mb-4">
            Follow the pins to join groups near you. Want to add yours?{' '}
            <button 
              onClick={() => setShowForm(!showForm)}
              className="text-posthog-red hover:opacity-100 font-semibold"
            >
              {showForm ? 'Hide form' : 'Submit a group'}
            </button>{' '}
            Want to start one?{' '}
            <a 
              href="https://posthog.com/community-incubator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-posthog-red hover:opacity-100 font-semibold"
            >
              Learn more →
            </a>
          </p>
          <Map groups={groups} />
        </div>

        {/* Submit Form - Below the map */}
        {showForm && (
          <div className="mt-12 border-t border-border-color pt-12">
            {submitted ? (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white border border-border-color rounded-lg p-12 text-center">
                  <h2 className="mb-4">✓ Submitted!</h2>
                  <p className="text-large mb-6 opacity-90">
                    Thank you for submitting your co-working group. It will be reviewed and published soon!
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setShowForm(false)
                    }}
                    className="px-5 py-2.5 bg-text-primary text-bg-primary rounded font-semibold hover:opacity-90 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                  <h2 className="mb-3">Submit a Co-Working Group</h2>
                  <p className="text-large opacity-70">
                    Share your co-working community with the world. Your submission will be reviewed before being published.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border border-border-color rounded-lg p-8">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="group_name" className="block font-semibold mb-2">
                        Group Name *
                      </label>
                      <input
                        type="text"
                        id="group_name"
                        name="group_name"
                        required
                        value={formData.group_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border-color rounded focus:outline-none focus:ring-2 focus:ring-text-primary"
                        placeholder="SF Tech Founders"
                      />
                    </div>

                    <div>
                      <label htmlFor="location" className="block font-semibold mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        required
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border-color rounded focus:outline-none focus:ring-2 focus:ring-text-primary"
                        placeholder="San Francisco, CA"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block font-semibold mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-border-color rounded focus:outline-none focus:ring-2 focus:ring-text-primary"
                          placeholder="San Francisco"
                        />
                      </div>
                      <div>
                        <label htmlFor="country" className="block font-semibold mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-border-color rounded focus:outline-none focus:ring-2 focus:ring-text-primary"
                          placeholder="USA"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="description" className="block font-semibold mb-2">
                        Description *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        required
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-4 py-3 border border-border-color rounded focus:outline-none focus:ring-2 focus:ring-text-primary"
                        placeholder="Tell us about your co-working group..."
                      />
                    </div>

                    <div>
                      <label htmlFor="website_url" className="block font-semibold mb-2">
                        Website URL
                      </label>
                      <input
                        type="url"
                        id="website_url"
                        name="website_url"
                        value={formData.website_url}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border-color rounded focus:outline-none focus:ring-2 focus:ring-text-primary"
                        placeholder="https://yourgroup.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="tags" className="block font-semibold mb-2">
                        Tags
                      </label>
                      <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border-color rounded focus:outline-none focus:ring-2 focus:ring-text-primary"
                        placeholder="tech-focused, weekly, founders (comma-separated)"
                      />
                      <p className="text-small opacity-60 mt-1">Separate tags with commas</p>
                    </div>

                    <div>
                      <label htmlFor="group_status" className="block font-semibold mb-2">
                        Group Status *
                      </label>
                      <select
                        id="group_status"
                        name="group_status"
                        required
                        value={formData.group_status}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border-color rounded focus:outline-none focus:ring-2 focus:ring-text-primary"
                      >
                        <option value="open">Open to new members</option>
                        <option value="full">Currently full</option>
                        <option value="seeking_lead">Seeking new lead</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="added_by" className="block font-semibold mb-2">
                        Your Name or Email *
                      </label>
                      <input
                        type="text"
                        id="added_by"
                        name="added_by"
                        required
                        value={formData.added_by}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border-color rounded focus:outline-none focus:ring-2 focus:ring-text-primary"
                        placeholder="jane@example.com"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full px-6 py-4 bg-text-primary text-bg-primary rounded font-semibold hover:opacity-90 transition disabled:opacity-50"
                      >
                        {submitting ? 'Submitting...' : 'Submit for Review'}
                      </button>
                    </div>
                  </div>
                </form>

                <p className="text-small opacity-60 mt-6 text-center">
                  All submissions are reviewed before being published. We typically review within 24-48 hours.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Further Reading */}
        <div className="mt-12 border-t border-border-color pt-12">
          <h2 className="mb-4">Further Reading</h2>
          <p className="text-large opacity-90 mb-6">
            Writing and resources from co-working communities we're inspired by.
          </p>
          <ul className="space-y-3">
            <li>
              <a
                href="https://buildspace.so/letter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-posthog-red hover:opacity-100 font-semibold"
              >
                Buildspace Letter →
              </a>
            </li>
            <li>
              <a
                href="https://toolbox.socratica.info/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-posthog-red hover:opacity-100 font-semibold"
              >
                Socratica Toolbox →
              </a>
            </li>
            <li>
              <a
                href="https://x.com/itsDrDrewithaSh/status/1941939862996660669"
                target="_blank"
                rel="noopener noreferrer"
                className="text-posthog-red hover:opacity-100 font-semibold"
              >
                @itsDrDrewithaSh on X →
              </a>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
