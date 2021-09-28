import React from 'react'

import Spot from './Spot'
import Label from './Label'

export default function Info(props) {

  const { meshProps, data, isAdmin } = props

  if (isAdmin) return (
    <Spot meshProps={meshProps} data={data} type="info" />
  )
  else return (
    <Label position={meshProps.position} labelText={data.text} />
  )
}

