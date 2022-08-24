import { useState } from '#app'
export const setLayout = () => useState<string>('layout', () => 'default')
