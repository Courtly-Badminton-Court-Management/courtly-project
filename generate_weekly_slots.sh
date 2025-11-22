#!/bin/bash
set -e

echo "🚀 Starting Courtly Data Setup..."

# 1. Check if Docker is running
if ! docker compose ps | grep -q "Up"; then
    echo "❌ Error: Docker containers are not running."
    echo "   Please run 'docker compose up -d' first."
    exit 1
fi

echo "⏳ Waiting for Backend to be ready..."
# Loop until Django can actually execute code
until docker compose exec -T backend python -c "print('ready')" > /dev/null 2>&1; do
  echo "   ...waiting for Django..."
  sleep 3
done

# 2. Ensure Club ID 1 and 6 Courts Exist
echo "🏟️  Ensuring Club ID 1 and 6 Courts exist..."
docker compose exec -T backend python manage.py shell -c "
from core.models import Club
from booking.models import Court

# Create/Get Club
c, _ = Club.objects.get_or_create(
    id=1, 
    defaults={'name': 'Courtly Arena'}
)

# Create Courts 1-6
for i in range(1, 7):
    court, created = Court.objects.get_or_create(name=f'Court {i}', club=c)
    # Optional: print only if created to keep logs clean
    # if created: print(f'   Created Court {i}')

print(f'✅ All 6 courts are ready for {c.name}')
"

# 3. Calculate Dates (Today + 7 Days)
START_DATE=$(date +%Y-%m-%d)
END_DATE=$(docker compose exec -T backend python -c "import datetime; print((datetime.date.today() + datetime.timedelta(days=7)).strftime('%Y-%m-%d'))")

# 4. Generate Slots
echo "⚙️  Generating slots from $START_DATE to $END_DATE..."
docker compose exec -T backend python manage.py generate_slots --club 1 --start $START_DATE --end $END_DATE

echo "✅ Success! System is ready with 6 Courts and Weekly Slots."