import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useSubscriptions(session: any) {
  const [subs, setSubs] = useState<any[]>([])
  const [invitedMap, setInvitedMap] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!session?.user) return

      // 1. Get owned subscriptions
      const { data: owned, error: ownedError } = await supabase
        .from('subscriptions')
        .select('id, name, created_at, registered_at, password')
        .eq('owner_id', session.user.id)

      // 2. Get invited subscriptions
      const { data: invitedEditors = [] as any[], error: invitedError } = await supabase
        .from('subscription_editors')
        .select('subscription_id, email, inviter_email')
        .eq('email', session.user.email.toLowerCase())
        .eq('accepted', true)

      let invitedSubs: any[] = []
      let inviterMap: Record<string, string> = {}

      if (invitedEditors != null && invitedEditors?.length > 0) {
        const ids = invitedEditors.map(i => i.subscription_id)
        const { data: extraSubs, error: extraErr } = await supabase
          .from('subscriptions')
          .select('id, name, created_at, password')
          .in('id', ids)

        if (extraErr) {
          console.error('Error fetching invited subscriptions:', extraErr)
        } else {
          invitedSubs = extraSubs || []
          invitedEditors.forEach(i => {
            inviterMap[i.subscription_id] = i.inviter_email
          })
        }
      }

      if (invitedError) {
        console.error('Error fetching invited editors:', invitedError)
        return
      }

      if (ownedError || invitedError) {
        console.error('Error fetching subscriptions:', ownedError || invitedError)
        return
      }

      setInvitedMap(inviterMap)
      setSubs([...(owned || []), ...invitedSubs])
    }

    fetchSubscriptions()
  }, [session])

  return {
    subs,
    invitedMap
  }
} 